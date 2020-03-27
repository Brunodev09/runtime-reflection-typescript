import ReflectInformation from "./ReflectInformation";

class RuntimeCache {
    private classes: Map<string, string[]>;
    constructor() {
        this.classes = new Map();
    }

    get GET_CACHE() { return this.classes };

    SET_CACHE(data: ReflectInformation) {
        this.classes.set(data.classname, data.orderedTypes);
    }

    getTypesByClassName(className: string) {
        return this.classes.get(className);
    }
}

export default new RuntimeCache();