# Parses an object in string format to a javascript object

Parses values of type boolean, strings, numbers, undefined, null, array and object.
Regex to do at a later time.

Comments and whitespace in the string are ignored.

## Two apis

a) stringToObject / stringToAny

stringToObject is to be used if you expect the string to only be an object.
It will throw an error with message 'String is not an object' if not an object.

```typescript
const example = stringToObject(`{
      double: "hello",
      single:'world' ,
      multiline : 'm\
ultiline',
      concatenation:'hello' + 'world',
      isTrue:true,
      isFalse:false,
      isUndefined:undefined,
      isNull:null,
      binary:0b1010,
      positiveBinary:+0b1010,
      negativeBinary:-0b1010,
      binaryWithSeparators:0b1_0_1_0,
      octalLegacy:0644,
      octal:0o7, // with signs and separators
      hex:0xAbCD, // with signs and separators
      integer:1234567890, // with signs and separators
      float1:0.0123456789 /* with signs */,
      float2:.0123456789, // with signs
      float3:2e2,
      float4:2_0_1.0_1e3_2,
      binaryBigInt:0b1010n, // and hex, octal and integer
      arrayEmpty:[],
      array:[1,,2],
      nestedArray:[
        [1,2],
        [
          'one',
          'two',
        ]
      ],
      nestedObject:{nested1:'one'}
    }`);

```

stringToAny will work with any allowed type represented as a string.
It will throw error with message 'Malformed' if malformed.

```typescript
const example = stringToAny(`[1,'Two',true,{p:'v'}]`)';
```

b) StringToObjectParser

This works a character at a time returning a ProcessResult.  
If malformed will return ProcessResult.Break
When completed call complete.
**Do not pass the first {**

```
enum ProcessResult{Continue,Completed,Break} 
const stringToObjectParser = new StringToObjectParser();
stringToObjectParser.process('h'); // ProcessResult.Continue
stringToObjectParser.process('i'); // ProcessResult.Continue
stringToObjectParser.process(':'); // ProcessResult.Continue
stringToObjectParser.process('"'); // ProcessResult.Continue
stringToObjectParser.process('w'); // ProcessResult.Continue
stringToObjectParser.process('o'); // ProcessResult.Continue
stringToObjectParser.process('r'); // ProcessResult.Continue
stringToObjectParser.process('l'); // ProcessResult.Continue
stringToObjectParser.process('d'); // ProcessResult.Continue
stringToObjectParser.process('"'); // ProcessResult.Continue
stringToObjectParser.process('}'); // ProcessResult.Completed
expect(stringToObjectParser.getCompleted()).toEqual({hi:'world'});


```


