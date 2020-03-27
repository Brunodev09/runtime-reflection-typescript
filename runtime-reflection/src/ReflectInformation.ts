export default class ReflectInformation {
    classname: string;
    orderedTypes: string[];
    constructor(className: string, orderedTypes: string[]) {
        this.classname = className;
        this.orderedTypes = orderedTypes;
    }
}