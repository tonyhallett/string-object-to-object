import { IValueOnlyParser, ValueOnlyResult } from "../IValueOnlyParser";
import { StackManager, ProcessResult } from "../../../stringToObjectParser";
import { FloatOrDecimalParser } from "./floatOrDecimalParser";
import { OctalParser } from "./number systems/octalParser";
import { HexParser } from "./number systems/hexParser";
import { FloatParser } from "./floatParser";
import { ProcessorLookup, Processor } from "./common";
import { BinaryParser } from "./number systems/binaryParser";
import { NumberSystemBase } from "./number systems/numberSystemBase";
enum NumberParserState {NoZero,Zero}
export class NumberParser implements IValueOnlyParser{
  private state = NumberParserState.NoZero
  private negative = false;
  private result!:ValueOnlyResult
  private processorLookup:ProcessorLookup = new ProcessorLookup();
  type: "ValueOnly" = 'ValueOnly';

  constructor(private readonly stackManager:StackManager){
    const octalLegacyProcessor:Processor<['0','1','2','3','4','5','6','7']> = [['0','1','2','3','4','5','6','7'],(octalDigit => {
      switch(this.state){
        case NumberParserState.Zero:
          this.stackManager.setCurrent(OctalParser.Legacy(this.negative,octalDigit));
          return ProcessResult.Continue;
        case NumberParserState.NoZero:
          if(octalDigit === '0'){
            this.state = NumberParserState.Zero;
            return ProcessResult.Continue;
          }
          return this.processFloatOrDecimal(octalDigit);
      }
    })];
    const nonOctalDigitProcessor: Processor<['8','9']> = [['8','9'],(eightOrNine) => {
      return this.processFloatOrDecimal(eightOrNine);
    }]
    this.processorLookup.add(
      /* should +-+-123 be allowed */
      [['+','-'], () => ProcessResult.Break],
      ['_', this.processSeparator],
      ['.', this.processFloat],
      [['x','X'],this.createNumberSystemProcessor(HexParser)],
      [['b','B'], this.createNumberSystemProcessor(BinaryParser)],
      [['o','O'], this.createNumberSystemProcessor(OctalParser)],
      octalLegacyProcessor,
      nonOctalDigitProcessor
    )
    
  }
  stackCompleted(parser: IValueOnlyParser):ProcessResult {
    this.result = parser.getCompleted();
    return ProcessResult.Completed;
  }
  getCompleted(): ValueOnlyResult {
    return this.result;
  }
  process(char: string): ProcessResult {
    const processor = this.processorLookup.get(char);
    if(processor){
      return processor.bind(this)(char);
    }
    return ProcessResult.Break;
  }
  private processFloatOrDecimal(numberChar:'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'):ProcessResult{
    //so is either 08, 09, 1,2,3,4,5,6,7,8,9 ( not 0_)
    //can omit the leading 0
    this.stackManager.setCurrent(FloatOrDecimalParser.Number(this.stackManager,numberChar,this.negative));
    return ProcessResult.Continue;
  }
  private processFloat():ProcessResult.Continue{
    this.stackManager.setCurrent(FloatParser.DecimalPoint((this.negative?'-':'') + '.'));
    return ProcessResult.Continue;
  }
  private createNumberSystemProcessor(parserCtor:new(negative:boolean)=>NumberSystemBase){
    return () => {
      if(this.state === NumberParserState.Zero){
        this.stackManager.setCurrent(new parserCtor(this.negative));
        return ProcessResult.Continue;
      }
      return ProcessResult.Break;
    }
  }
  
  private processSeparator():ProcessResult{
    if(this.state === NumberParserState.NoZero){
      return ProcessResult.Break;
    }
    this.stackManager.setCurrent(FloatOrDecimalParser.Separated(this.stackManager,this.negative));
    return ProcessResult.Continue;
  }
  
  static Signed(negative:boolean,stackManager:StackManager):NumberParser{
    const numberParser = new NumberParser(stackManager);
    if(negative) numberParser.negative = true;
    return numberParser;
  }
  static Zero(stackManager:StackManager):NumberParser{
    const numberParser = new NumberParser(stackManager);
    numberParser.state = NumberParserState.Zero;
    return numberParser;
  }
}