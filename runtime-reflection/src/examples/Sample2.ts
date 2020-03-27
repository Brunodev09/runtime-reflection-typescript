// import { Data } from "./Sample";
import { InterfaceSimulator } from "./Sample3";
import { ValidateModel } from "../RuntimeValidator";

// @ts-ignore
// let d = new Data("12", 1, "sd");

let objectListFromSomewhere = [{ station: 1, name: "test" }, { station: 2, name: "test2" }];

ValidateModel(objectListFromSomewhere, InterfaceSimulator, { fastValidationEnabled: true });