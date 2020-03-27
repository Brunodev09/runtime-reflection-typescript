import { TypedRuntime, listener } from "../RuntimeValidator";

// Register these 3 events to listen for logging of the validation process in realtime.
listener.Emitter.on('match-prop', (data) => console.log(data));
listener.Emitter.on('match-completed', (data) => console.log(data));
listener.Emitter.on('error', (data) => console.error(data));

@TypedRuntime
export class InterfaceSimulator {
    station?: number;
    name?: string;

    constructor(station: number, name: string) {
        this.station = station;
        this.name = name;
    }
}