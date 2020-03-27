import Cache from "../RuntimeCache";
import { TypedRuntime, Validate, listener } from "../RuntimeValidator";

// Register these 3 events to listen for logging of the validation process in realtime.
listener.Emitter.on('match-prop', (data) => console.log(data));
listener.Emitter.on('match-completed', (data) => console.log(data));
listener.Emitter.on('error', (data) => console.error(data));

@TypedRuntime
export class Data {
    station: number;
    name: string;
    letters: string;
    constructor(station: number, name: string, letters: string) {
        this.station = station;
        this.name = name;
        this.letters = letters;

        Validate(this);

    }
}