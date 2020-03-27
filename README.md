# runtime-reflection-typescript

This is a custom script to perform realtime type-checking in Javascript objects using the Typescript compiler decorators.

## Getting Started

### Dependencies

* Typescript
* [https://rbuckton.github.io/reflect-metadata/]

### How to use

This framework uses Typescript compiler experimental annotations to perform realtime type checking. It basically emulates the effect of `Reflection`, native in languages like Java, C#, C++ and other strongly typed languages.

## Basic usage:

1. Make sure that `experimentalDecorators` flag is set to `true` on your `tsconfig.json` file:

   ```javascript
   {
      "compilerOptions": {
        "experimentalDecorators": true,
      }
   }
   ```

2. Import the library:

   ```typescript
   import { TypeChecker } from "./bdv-type-parser";
   ```


3. Add the `@TypedRuntime` decorator to your target class.
   That will enable the extraction of the metadata that is going to be used in runtime.

    ```typescript
    @TypedRuntime
    class CustomClass {
        id: number;
        name: string;
        constructor (id: number, name: string) {
            this.id = id;
            this.name = name;
        }
    }
    ```

3. Call the validator as needed:

   ```typescript
   TypeChecker.Validate({ id: 'I should be a number =/', name: 'Robot' }, StationClass);
   ```

   If one or more properties of the given object are not compliant with the target class properties,
   the validator will handle the mismatches. Depending on the case, it may throw an error or convert
   the mismatched values to the desired property types. 

--- 

# Example

    Example of runtime-execution, with logs emitted and convert operations active, after attempting to validate the class `Data` with an object with mismatching types.
---

```typescript
        @TypedRuntime
        class Data {
        id: number;
        name: string;
        lastname: string;
        constructor(id: number, name: string, lastname: string) {
            this.id = id;
            this.name = name;
            this.lastname = lastname;
        }
    }

// Arrays of objects are also valid!
    const wrongObject = {
        id: '12532',
        name: 0000,
        lastname: "Zeros"
    }
    
    TypeChecker.ValidateModel(wrongObject, Data);
```

---

    
    $ node dist/src/Sample2.js

```
[Runtime-Addon][Mismatch event] detected on validation of class Data. Expected type: number. Received type: string.
[Runtime-Addon][Conversion event] detected. Type string converted to required type number.
[Runtime-Addon][Mismatch event] detected on validation of class Data. Expected type: string. Received type: number.
[Runtime-Addon][Conversion event] detected. Type number converted to required type string.
[Runtime-Addon][Match event] detected on validation of class Data. Type string validated with success.
[Runtime-Addon][Class event] detected on validation completion of class Data. This class was inconsistent on 2 property(ies).
```

---

# Customization
    You can customize the behaviour of the type-checker through the file `runtime.json`.

    ```json
        {
        "runTimeCompilationChecking": true,
        "crashOnAnyException": false,
        "events": true,
        "conversionRules": {
            "stringToNumber": {
                "resolve": "convert"
            },
            "numberToString": {
                "resolve": "convert"
            },
            "stringToBoolean": {
                "resolve": "convert"
            },
            "objectToPrimitive": {
                "resolve": "crash"
            },
            "null": {
                "resolve": "ignore"
            }
        }
    }
    ``` 


## Authors

Brunodev09 - Bruno Mayol Giannotti

## License

MIT