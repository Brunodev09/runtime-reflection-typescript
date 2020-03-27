import "reflect-metadata";
import ReflectInformation from "./ReflectInformation";
import Cache from "./RuntimeCache";
import __events__ from "events";
import settings from "./runtime.json";
import { RuntimeTags, RuntimeChannels } from "./RuntimeTags";

// @TODO: Class specific scope of control instead of general settings.

// @Listener - Listens on 'error', 'match-prop' and 'match-completed'.
const Emitter = new __events__.EventEmitter();

let { crashOnAnyException, events, runTimeCompilationChecking, conversionRules } = settings;

const listener = {
    Emitter
};

// Attempt to decompile and serialize class metadata.
function TypedRuntime(target: any) {
    let className;
    try {
        className = transpileClass(target);
        const types = transpileTypes(Reflect.getMetadata('design:paramtypes', target));
        Cache.SET_CACHE(new ReflectInformation(className, types));
    } catch (e) {
        return console.error(`[Runtime-Addon][Core-Error] Runtime type checking unexpected exception thrown from class ${className} transpilement: Stack trace ahead -> ${e}`);
    }
}

// Decompiling types metadata.
function transpileTypes<T>(types: T[]) {
    let serializedTypes: string[] = [];
    for (let type of types) {
        serializedTypes.push(String(type).split('function').join('').split('()')[0].replace(" ", "").toLowerCase());
    }
    return serializedTypes;
}

// Decompiling class header metadata.
function transpileClass<C>(classConstruct: C): string {
    return String(classConstruct).split('class').join('').split(' {')[0].replace(" ", "");
}

function emitLog(channel: string, tag: string, msg: string) {
    const primaryTag = RuntimeTags.MAIN;
    let secundaryTag = "";
    let channelInput = "";
    switch (tag) {
        case RuntimeTags.CORE:
            secundaryTag = "[Core event]";
            break;
        case RuntimeTags.CONVERSION:
            secundaryTag = "[Conversion event]";
            break;
        case RuntimeTags.CLASS:
            secundaryTag = "[Class event]";
            break;
        case RuntimeTags.MATCH:
            secundaryTag = "[Match event]";
            break;
        case RuntimeTags.MISMATCH:
            secundaryTag = "[Mismatch event]";
            break;
    }
    switch (channel) {
        case RuntimeChannels.MATCH_PROP:
            channelInput = channel;
            break;
        case RuntimeChannels.MATCH_COMPLETED:
            channelInput = channel;
            break;
        case RuntimeChannels.ERROR:
            channelInput = channel;
            break;
    }
    Emitter.emit(channelInput, primaryTag + secundaryTag + msg);
}

function emitFailedConversionEvent(className: string, received: string, attempted: string) {
    emitLog('error', 'CONVERSION', ` detected on validation of class ${className}. Could not convert ${typeof received} to ${attempted}.`);
}

function crash(description: string) {
    throw new Error(description);
}

// Runtime checking
function Validate(construct: any, instance?: any, opts?: { fastValidationEnabled: boolean }) {

    if (!runTimeCompilationChecking) return {};

    const types = instance ? Cache.getTypesByClassName(instance.constructor.name) : Cache.getTypesByClassName(construct.constructor.name);
    const objectName = instance ? instance.constructor.name : construct.constructor.name;

    if (!types) {
        emitLog('error', 'TYPES_NOT_FOUND', ` detected on validation of class ${construct.constructor.name}. No types have been found.`);
        return {};
    }

    let iterator = 0;
    let flagCount = 0;
    const keys = Object.keys(construct);
    for (const value of Object.values(construct)) {
        if (typeof value !== types[iterator]) {
            flagCount++;
            if (events) {
                emitLog('error', 'MISMATCH', ` detected on validation of class ${objectName}. Expected type: ${types[iterator]}. Received type: ${typeof value}.`);
            }
            if (crashOnAnyException) {
                // @warning - This will throw!
                crash(`Exception detected on validation of class ${objectName}. Expected type: ${types[iterator]}. Received type: ${typeof value}.`);
            }
            if (types[iterator] === "boolean" && (value === "true" || value === "false")) {
                switch (conversionRules.stringToBoolean.resolve) {
                    case "convert":
                        if (events) emitLog('match-prop', 'CONVERSION', ` detected. Type ${typeof value} converted to required type ${types[iterator]}.`)
                        // This will never be null, we just need an else to keep the ternary operator valid and avoid other ifs.
                        construct[keys[iterator]] = value === "true" ? true : value === "false" ? false : null;
                        break;
                    case "crash":
                        // @warning - This will throw!
                        crash(`Failed to convert ${typeof value} to ${types[iterator]}.`);
                        break;
                    case "ignore":
                        break;
                    default:
                        emitFailedConversionEvent(objectName, value, types[iterator]);
                        break;
                }
            }
            else if (types[iterator] === "number" && typeof value === "string" && !isNaN(value as any)) {
                switch (conversionRules.stringToNumber.resolve) {
                    case "convert":
                        if (events) emitLog('match-prop', 'CONVERSION', ` detected. Type ${typeof value} converted to required type ${types[iterator]}.`);
                        construct[keys[iterator]] = Number(value);
                        break;
                    case "crash":
                        crash(`Failed to convert ${typeof value} to ${types[iterator]}.`);
                        break;
                    case "ignore":
                        break;
                    default:
                        emitFailedConversionEvent(objectName, value, types[iterator]);
                        break;
                }
            }
            else if (types[iterator] === "string" && typeof value === "number") {
                switch (conversionRules.numberToString.resolve) {
                    case "convert":
                        if (events) emitLog('match-prop', 'CONVERSION', ` detected. Type ${typeof value} converted to required type ${types[iterator]}.`);
                        construct[keys[iterator]] = String(value);
                        break;
                    case "crash":
                        // @warning - This will throw!
                        crash(`Failed to convert ${typeof value} to ${types[iterator]}.`);
                        break;
                    case "ignore":
                        break;
                    default:
                        emitFailedConversionEvent(objectName, String(value), types[iterator]);
                        break;
                }
            }
            else if (typeof value === "object" && value !== null) {
                switch (conversionRules.objectToPrimitive.resolve) {
                    case "convert":
                        // TODO: Expand this in the future.
                        break;
                    case "crash":
                        // @warning - This will throw!
                        crash(`Failed to convert ${typeof value} to ${types[iterator]}.`);
                        break;
                    case "ignore":
                        break;
                    default:
                        emitFailedConversionEvent(objectName, JSON.stringify(value), types[iterator]);
                        break;
                }
            }
            else if (value === null) {
                switch (conversionRules.null.resolve) {
                    case "crash":
                        // @warning - This will throw!
                        crash(`Failed to convert NULL value to ${types[iterator]}.`);
                        break;
                    case "ignore":
                        break;
                    default:
                        emitFailedConversionEvent(objectName, JSON.stringify(value), types[iterator]);
                        break;
                }
            }
            else emitFailedConversionEvent(objectName, JSON.stringify(value), types[iterator]);
        }
        else {
            if (events) {
                emitLog('match-prop', 'MATCH', ` detected on validation of class ${objectName}. Type ${types[iterator]} validated with success.`);
            }
        }
        iterator++;
    }
    if (events) {
        if (!flagCount) emitLog('match-completed', 'CLASS', ` detected on validation completion of class ${objectName}. All types have been validated and the class has been instantiated with sucess.`);
        else emitLog('match-completed', 'CLASS', `detected on validation completion of class ${objectName}. This class was inconsistent on ${flagCount} property(ies).`);
    }
    return construct;
}

function ValidateModel(targets: any, ExpectedModelClass: any, opts: { fastValidationEnabled: boolean }) {
    if (!runTimeCompilationChecking) return false;

    const { fastValidationEnabled } = opts;
    let successCount = 0;
    if (!targets.length) {
        Validate(targets, new ExpectedModelClass(), { fastValidationEnabled });
        return true;
    }
    for (let object of targets) {
        Validate(object, new ExpectedModelClass(), { fastValidationEnabled });
        if (fastValidationEnabled) successCount++;
        if (successCount > 1) break;
    }

    return true;
}

export {
    listener,
    Validate,
    TypedRuntime,
    ValidateModel
}
