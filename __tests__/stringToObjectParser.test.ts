import { StringToObjectParser, ProcessResult } from "../src/stringToObjectParser";

function executeSkipOnlyTests<T extends {description:string,skip?:boolean, only?:boolean}> (tests:Array<T>, testExecution:(test:T)=>void){
  const onlyTests = tests.filter(t=>t.only);
  if(onlyTests.length>0){
    tests = onlyTests;
  }
  tests.forEach(test => {
    if(!test.skip){
      it(test.description,() => {
        testExecution(test);
      })
    }
  })
}

describe('stringToObjectParser', () => {
  describe('completion tests', () => {
    describe('bigint', () => {
      const tests = [{
        description:'binary bigint',
        stringObject:`prop1:0b1010n}`,
        //@ts-ignore
        expectedBigInt:BigInt('0b1010'),
      }, 
      {
        description:'hex',
        stringObject:`prop1:0x1fffffffffffffn}`,
        //@ts-ignore
        expectedBigInt:BigInt('0x1fffffffffffff')
      }, 
      {
        description:'octal',
        stringObject:`prop1:0o7n}`,
        //@ts-ignore
        expectedBigInt:BigInt('0o7'),
      },
      {
        description:'integer bigint',
        stringObject:`prop1:1234567890n}`,
        //@ts-ignore
        expectedBigInt:BigInt(1234567890)
      }];
      tests.forEach(test => {
        it(test.description, ()=> {
          const toParse = test.stringObject;
          const toParseLength = toParse.length;
          const stringToObjectParser = new StringToObjectParser();
          for (var x = 0, c=''; c = toParse.charAt(x); x++) { 
            const result = stringToObjectParser.process(c);
            if(x<toParseLength-1){
              expect(result).toBe(ProcessResult.Continue);
            }else{
              expect(result).toBe(ProcessResult.Completed);
            }
          }
          const bigInt = stringToObjectParser.getCompleted().prop1;
          expect(typeof bigInt).toEqual('bigint');
          expect(bigInt).toEqual(test.expectedBigInt);
        })
      })
     
    })
    interface CompletionTest{
      description:string,
      stringObject:string,
      expectedResult:object,
      skip?:true,
      only?:boolean
    }
    let raw = (String as any).raw;
    let completionTests:CompletionTest[] = [
      {
        description:'empty object',
        stringObject:`}`,
        expectedResult:{ },
      },
      //#region quotes
      {
        description:'no whitespace, single property string, double quote string value, no comma',
        stringObject:`prop:"prop value"}`,
        expectedResult:{
          prop:"prop value"
        }
      },
  
      {
        description:'no whitespace, single property string, single quote string value, no comma',
        stringObject:`prop:'prop value'}`,
        expectedResult:{
          prop:"prop value"
        }
      },
      {
        description:'no whitespace, single property string, single quote string value, comma',
        stringObject:`prop:'prop value',}`,
        expectedResult:{
          prop:"prop value"
        }
      },
      {
        description:'string escaping not ending with escaped matching quote',
        stringObject:raw`prop:"\""}`,
        expectedResult:{
          prop:"\""
        },
      },
      {
        description:'string escaping non quotes',
        stringObject:raw`prop:"\t"}`,
        expectedResult:{
          prop:"\t",
        },
      },
      {
        description:'string escaping new line',
        stringObject:raw`prop:"a\nb"}`,
        expectedResult:{
          prop:"a\nb",
        },
      },
      {
        description:'new lines with \\',
        stringObject:`prop:"x\
y"}`,
        expectedResult:{
          prop:"x\
y",
        },
      },
      {
        description:'backtick no escapes',
        stringObject:"prop:`123`}",
        expectedResult:{
          prop:`123`
        },
      },
      {
        description:'backtick multiple lines',
        stringObject:`prop:\`123
4\`}`,
        expectedResult:{
          prop:`123
4`
        },
      },
      {
        description:'backtick escapes',
        stringObject:"prop:`1\\`2`}",
        expectedResult:{
          prop:'1`2'
        },
      },
      {
        description:'concatenation',
        stringObject:`prop:'1' + '2' + 
      "3" + \`4\`
      }`,
        expectedResult:{
          prop:'1234'
        },
      },
      //#endregion
      //#region whitespace
      {
        description:'pre prop whitespace, single property string, single quote string value',
        stringObject:` prop:'prop value'}`,
        expectedResult:{
          prop:"prop value"
        }
      },
      {
        description:'after prop whitespace, single property string, single quote string value',
        stringObject:`prop :'prop value'}`,
        expectedResult:{
          prop:"prop value"
        }
      },
      {
        description:'pre value whitespace, single property string, single quote string value',
        stringObject:`prop: 'prop value'}`,
        expectedResult:{
          prop:"prop value"
        }
      },
      {
        description:'after value whitespace, single property string, single quote string value',
        stringObject:`prop:'prop value' }`,
        expectedResult:{
          prop:"prop value"
        }
      },
  
  
      {
        description:'after comma whitespace, single property string, single quote string value, comma',
        stringObject:`prop:'prop value' , }`,
        expectedResult:{
          prop:"prop value"
        }
      },
      //#endregion
      //#region words
      {
        description:'true value',
        stringObject:`prop:true}`,
        expectedResult:{
          prop:true
        }
      },
      {
        description:'false value',
        stringObject:`prop:false}`,
        expectedResult:{
          prop:false
        }
      },
      {
        description:'undefined value',
        stringObject:`prop:undefined}`,
        expectedResult:{
          prop:undefined
        }
      },
      {
        description:'null value',
        stringObject:`prop:null}`,
        expectedResult:{
          prop:null
        }
      },
      //#endregion
      
      //#region numbers
      //#region binary
      {
        description:'binary',
        stringObject:`prop1:0b1010}`,
        expectedResult:{
          prop1:0b1010
        }
      },
      {
        description:'signed binary +',
        stringObject:`prop1:+0b1010}`,
        expectedResult:{
          prop1:+0b1010
        }
      },
      {
        description:'signed binary -',
        stringObject:`prop1:-0b1010}`,
        expectedResult:{
          prop1:-0b1010
        }
      },
      {
        description:'binary with separators',
        stringObject:`prop1:0b1_0_1_0}`,
        expectedResult:{
          prop1:0b1010
        }
      }, 
      //#endregion
      //#region hex
      {
        description:'hex',
        stringObject:`prop1:0xAbCD}`,
        expectedResult:{
          prop1:0xABCD
        },
      },
      {
        description:'signed hex +',
        stringObject:`prop1:+0xAbCD}`,
        expectedResult:{
          prop1:+0xABCD
        }
      }, 
      {
        description:'signed hex -',
        stringObject:`prop1:-0xAbCD}`,
        expectedResult:{
          prop1:-0xABCD
        }
      }, 
      {
        description:'hex with separators',
        stringObject:`prop1:0xA_b_C_D}`,
        expectedResult:{
          prop1:0xABCD
        }
      }, 
      //#endregion
      //#region octal
      {
        description:'octal legacy',
        stringObject:`prop1:0644}`,
        expectedResult:{
          prop1:parseInt('0644',8)
        }
      },
      {
        description:'octal',
        stringObject:`prop1:0o7}`,
        expectedResult:{
          prop1:0o7
        }
      },
      {
        description:'signed octal +',
        stringObject:`prop1:+0o7}`,
        expectedResult:{
          prop1:+0o7
        }
      },
      {
        description:'signed octal -',
        stringObject:`prop1:-0o7}`,
        expectedResult:{
          prop1:-0o7
        }
      },
      {
        description:'octal with separators',
        stringObject:`prop1:0o7_1}`,
        expectedResult:{
          prop1:0o71
        }
      },  
      //#endregion
      //#region integers
      {
        description:'integer',
        stringObject:`prop1:1234567890}`,
        expectedResult:{
          prop1:1234567890
        }
      }, 
      {
        description:'integer positive',
        stringObject:`prop1:+1234567890}`,
        expectedResult:{
          prop1:+1234567890
        }
      },
      {
        description:'integer negative',
        stringObject:`prop1:-1234567890}`,
        expectedResult:{
          prop1:-1234567890
        }
      }, 
      {
        description:'integer separated',
        stringObject:`prop1: -1_2_345_67890}`,
        expectedResult:{
          prop1:-1_2_345_67890
        }
      }, 
      {
        description:'08 or 09 integers',
        stringObject:`prop1: -08_1_2}`,
        expectedResult:{
          prop1:-08_1_2
        }
      }, 
      {
        description:'0_ integers',
        stringObject:`prop1: +0_1_2}`,
        expectedResult:{
          prop1:+0_1_2
        }
      }, 
      {
        description:'0',
        stringObject:`prop1: 0}`,
        expectedResult:{
          prop1:0
        },
        only:true
      },
      //#endregion
      //#region floats
      {
        description:'float 0. no exponent',
        stringObject:`prop1:0.0123456789}`,
        expectedResult:{
          prop1:0.0123456789
        }
      },
      {
        description:'float . no exponent',
        stringObject:`prop1:.0123456789}`,
        expectedResult:{
          prop1:.0123456789
        }
      }, 
      {
        description:'float positive',
        stringObject:`prop1:+.0123456789}`,
        expectedResult:{
          prop1:+.0123456789
        }
      },
      {
        description:'float negative',
        stringObject:`prop1:-.123456789}`,
        expectedResult:{
          prop1:-.123456789
        }
      },
      {
        description:'float negative ex 2',
        stringObject:`prop1:-1.123456789}`,
        expectedResult:{
          prop1:-1.123456789
        }
      },
      {
        description:'float just exponent',
        stringObject:`prop1:2e2}`,
        expectedResult:{
          prop1:2e2
        },
      },
      {
        description:'float positive exponent',
        stringObject:`prop1:2e+2}`,
        expectedResult:{
          prop1:2e+2
        }
      },
      {
        description:'float negative exponent',
        stringObject:`prop1:2e-2}`,
        expectedResult:{
          prop1:2e-2
        }
      }, 
      {
        description:'float exponent after decimal point',
        stringObject:`prop1:123.e23}`,
        expectedResult:{
          prop1:123.e23
        }
      }, 
      {
        description:'float decimal and exponent',
        stringObject:`prop1:2.01e3}`,
        expectedResult:{
          prop1:2.01e3
        }
      }, 
      {
        description:'float separators',
        stringObject:`prop1:2_0_1.0_1e3_2}`,
        expectedResult:{
          prop1:2_0_1.0_1e3_2
        }
      }, 
      {
        description:'08 or 09 float',
        stringObject:`prop1:08_2.0_1e-2_3}`,
        expectedResult:{
          prop1:08_2.0_1e-2_3
        }
      }, 
      {
        description:'0_ float',
        stringObject:`prop1:0_12.0_1e3_2}`,
        expectedResult:{
          prop1:0_12.0_1e3_2
        }
      }, 
      //#endregion
      {
        description:'empty array',
        stringObject:`prop1:[]}`,
        expectedResult:{
          prop1:[]
        },
      },
      {
        description:'array one item',
        stringObject:`prop1:["one"]}`,
        expectedResult:{
          prop1:["one"]
        },
      },
      {
        description:'array multiple',
        stringObject:`prop1:[true, false]}`,
        expectedResult:{
          prop1:[true,false]
        },
      },
      {
        description:'array undefined',
        stringObject:`prop1:[,]}`,
        expectedResult:{
          prop1:[undefined]
        },
      },
      {
        description:'array multiple undefined 1',
        stringObject:`prop1:[ ,  123 ,,0b101011]}`,
        expectedResult:{
          prop1:[undefined,123,undefined, 0b101011]
        },
      },
      {
        description:'array multiple undefined 2',
        stringObject:`prop1:[,123,,]}`,
        expectedResult:{
          prop1:[undefined,123,undefined]
        },
      },
      {
        description:'array multiple undefined 3',
        stringObject:`prop1:[ true , ,  123 ,,]}`,
        expectedResult:{
          prop1:[true,undefined,123,undefined]
        },
      },
      {
        description:'array multiple undefined 4',
        stringObject:`prop1:[true,,123,,]}`,
        expectedResult:{
          prop1:[true,undefined,123,undefined]
        },
      },
      {
        description:'array multiple lines',
        stringObject:`prop1:[
          true,
          ,
          123
          ,
          ,
        ]}`,
        expectedResult:{
          prop1:[true,undefined,123,undefined]
        },
      },
      {
        description:'nested arrays',
        stringObject:`prop1:[[true,false],["One",1]]}`,
        expectedResult:{
          prop1:[[true,false],["One",1]]
        },
      },
      {
        description:'nested objects',
        stringObject:`prop1:{nestedProp:'nested1','nested-array':[true,9]}}`,
        expectedResult:{
          prop1:{nestedProp:'nested1', 'nested-array':[true, 9]}
        },
      },
      {
        description:'ignores single line comments',
        stringObject:`
        //this is a comment
        prop1:true }`,
        expectedResult:{
          prop1:true
        }
      },
      {
        description:'ignores single line comments after value',
        stringObject:`
        prop1:true //this is a comment
        }`,
        expectedResult:{
          prop1:true
        }
      },
      {
        description:'ignores multi line comments',
        stringObject:`
          /* */ prop1/**/
          /* */   :
          /* */true /* 
          
          */, /* * */
        }`,
        expectedResult:{
          prop1:true
        }
      },
      {
        description:'ignores array comments',
        stringObject:`prop1:[
            1 /* comment */,
            2 // comment
            /* comment */, 3 ,
            4// comment
          ]
        }`,
        expectedResult:{
          prop1:[
            1 /* comment */,
            2 // comment
            /* comment */ , 3 ,
            4// comment
          ]
        },
        skip:true

      },
      {
        description:'multiple properties',
        stringObject:`prop1:true,prop2:false}`,
        expectedResult:{
          prop1:true,
          prop2:false
        },
      },
    ]
    describe('non big int', () => {
      executeSkipOnlyTests(completionTests,(test) => {
        const toParse = test.stringObject;
        const toParseLength = toParse.length;
        const stringToObjectParser = new StringToObjectParser();
        for (var x = 0, c=''; c = toParse.charAt(x); x++) { 
          const result = stringToObjectParser.process(c);
          if(x<toParseLength-1){
            expect(result).toBe(ProcessResult.Continue);
          }else{
            expect(result).toBe(ProcessResult.Completed);
          }
        }
        expect(stringToObjectParser.getCompleted()).toEqual(test.expectedResult);
      })
    })
    
  })
  describe('failing tests', () => {
    interface FailingTest{
      description:string,
      stringObject:string,
      skip?:true,
      only?:boolean
    }
    function executeFailingTests(failingTests:Array<FailingTest>){
      executeSkipOnlyTests(failingTests,(test) => {
        const toParse = test.stringObject;
        const toParseLength = toParse.length;
        const stringToObjectParser = new StringToObjectParser();
        for (var x = 0, c=''; c = toParse.charAt(x); x++) { 
          const result = stringToObjectParser.process(c);
          if(x<toParseLength-1){
            expect(result).toBe(ProcessResult.Continue);
          }else{
            expect(result).toBe(ProcessResult.Break);
          }
        }
      })
    }
    describe('failing', () => {
      const failingTests:FailingTest[] = [
        {
          description:'+ separator',
          stringObject:'prop:+_'
        },
        {
          description:'- separator',
          stringObject:'prop:-_'
        },
        {
          description:'multiple signs',
          stringObject:'prop:-+'
        },
        {
          description:'not 0b',
          stringObject:'prop:-b'
        },
        {
          description:'not 0B',
          stringObject:'prop:-B'
        },
        {
          description:'not 0x',
          stringObject:'prop:-x'
        },
        {
          description:'not 0X',
          stringObject:'prop:-X'
        },
        {
          description:'not 0o',
          stringObject:'prop:-o'
        },
        {
          description:'not 0O',
          stringObject:'prop:-O'
        },
        {
          description:'sign after 0 +',
          stringObject:'prop:0+'
        },
        {
          description:'sign after 0 -',
          stringObject:'prop:0-'
        },
        {
          description:'sign after -0',
          stringObject:'prop:-0+'
        },
        {
          description:'not allowed after sign',
          stringObject:'prop:+x'
        },
        {
          description:'not allowed after 0',
          stringObject:'prop:0!'
        },

        {
          description:'multiple decimal points',
          stringObject:'prop:0.1.'
        },
        {
          description:'exponent after exponent',
          stringObject:'prop:0.2ee'
        },
        {
          description:'exponent after sign',
          stringObject:'prop:0.2e+e'
        },
        {
          description:'exponent after exponent digits',
          stringObject:'prop:0.2e2e'
        },
        {
          description:'sign after digits',
          stringObject:'prop:0.2-'
        },
        {
          description:'sign after exponent digits',
          stringObject:'prop:0.2e2-'
        },
        {
          description:'signs after signed exponent digits',
          stringObject:'prop:0.2e-2-'
        },
        {
          description:'sign after sign',
          stringObject:'prop:0.2e--'
        },

        {
          description:'ends with decimal point',
          stringObject:'prop:0.}'
        },
        {
          description:'ends with exponent',
          stringObject:'prop:0.2e}'
        },
        {
          description:'ends with signed exponent without digits',
          stringObject:'prop:0.2e-}'
        },
        // dealt with by the base class - no need to test for others
        {
          description:'ends with separator',
          stringObject:'prop:0.1_}',
        },
        // dealt with by the base class - no need to test for others
        {
          description:'double separator',
          stringObject:'prop:0.1__'
        },
        {
          description:'separator after decimal point',
          stringObject:'prop:0._'
        },
        {
          description:'separator after exponent',
          stringObject:'prop:0.1e_',
        },
        {
          description:'separator after sign',
          stringObject:'prop:0.1e+_',
        },
        //Float
        {
          description:'separator before exponent',
          stringObject:'prop:0.1_e',
        },
        //FloatOrDecimal
        {
          description:'separator before exponent',
          stringObject:'prop:1_e',
        },
        //FloatOrDecimal
        {
          description:'separator before .',
          stringObject:'prop:0_.',
        },
        //FloatOrDecimal
        {
          description:'separator before . path 2',
          stringObject:'prop:1_.',
        },
        //FloatOrDecimal
        {
          description:'0__',
          stringObject:'prop:0__',
        },
        //FloatOrDecimal ( decimal)
        {
          description:'big n after separator',
          stringObject:'prop:1_n'
        },
        //FloatOrDecimal ( covered by last a separator )
        {
          description:'0_',
          stringObject:'prop:0_}',
        },
        //ValueParser - bad delimiting chars
        {
          description:'Bad delimiter',
          stringObject:'prop:1x',
        },
        //FloatOrDecimal 
        {
          description:'Bad delimiter big N',
          stringObject:'prop:1N',
        },
        //NumberSystemBase
        {
          description:'Number System Bad delimiter big N',
          stringObject:'prop:0x1N',
        },
        {
          description:'separator before numbers',
          stringObject:'prop:-0b_',
        },
        {
          description:'separator before big n',
          stringObject:'prop:0b101_n',
        },
        {
          description:'big n no numbers 1',
          stringObject:'prop:-0bn',
        },
        {
          description:'big n no numbers 2',
          stringObject:'prop:+0bn',
        },
        {
          description:'big n no numbers 3',
          stringObject:'prop:0bn',
        },
        {
          description:'not allowed number chars binary',
          stringObject:'prop:0b2'
        },
        {
          description:'not allowed number chars octal',
          stringObject:'prop:0o9'
        },
        {
          description:'not allowed number chars hex',
          stringObject:'prop:0xp'
        },
        {
          description:'no separators with legacy octal',
          stringObject:'prop:06_'
        },
        {
          description:'bad comment',
          stringObject:'/x'
        },
        {
          description:'quoted new lines without \\',
          stringObject:`prop:"x
`
        },
        {
          description:'concatenation',
          stringObject:"prop:'1' + x"
        }
      ]
      executeFailingTests(failingTests);
    })
  })
})