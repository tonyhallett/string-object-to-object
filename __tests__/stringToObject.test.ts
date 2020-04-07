import { stringToObject } from "../src/stringToObject"

describe('stringToObject', () => {
  it('should return the parsed object', () => {
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
    
    expect(example).toEqual({
      double:'hello',
      single:'world',
      multiline:'multiline',
      concatenation:'helloworld',
      isTrue:true,
      isFalse:false,
      isUndefined:undefined,
      isNull:null,
      binary:0b1010,
      positiveBinary:+0b1010,
      negativeBinary:-0b1010,
      binaryWithSeparators:0b1010,
      octalLegacy:parseInt('0644',8),
      octal:0o7,
      hex:0xAbCD,
      integer:1234567890,
      float1:0.0123456789,
      float2:.0123456789,
      float3:2e2,
      float4:2_0_1.0_1e3_2,
      //@ts-ignore
      binaryBigInt:BigInt(0b1010n),
      arrayEmpty:[],
      array:[1,,2],
      nestedArray:[[1,2],['one','two']],
      nestedObject:{
        nested1:'one'
      }
    });
  });
  it('should throw if malformed', () => {
    expect(()=>stringToObject('')).toThrow();
    expect(()=>stringToObject('{')).toThrow();
    expect(()=>stringToObject(`{prop:'value}`)).toThrow();
  })
});