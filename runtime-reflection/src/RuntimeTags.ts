export enum RuntimeTags {
    MAIN = "[Runtime-Addon]",

    CORE = "CORE",
    CONVERSION = "CONVERSION",
    MISMATCH = "MISMATCH",
    MATCH = "MATCH",
    CLASS = "CLASS"
}

export enum RuntimeChannels {
    MATCH_COMPLETED = "match-completed",
    MATCH_PROP = "match-prop",
    ERROR = "error"
}