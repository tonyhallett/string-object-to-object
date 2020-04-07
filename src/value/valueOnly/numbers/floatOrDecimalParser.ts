import { IValueOnlyParser, ValueOnlyResult } from "../IValueOnlyParser";
import { StackManager, ProcessResult } from "../../../stringToObjectParser";
import { FloatParser } from "./floatParser";
import { OneToNine, digitsArray } from "../common";
import { SeparatedNumberLookupParser } from "./separatedBase/separatedNumberLookupParser";

export class FloatOrDecimalParser extends SeparatedNumberLookupParser{
  private floatResult:ValueOnlyResult|undefined;
  private bigInt = false;
  
  constructor(private readonly stackManager:StackManager,private chars:string, private readonly negative:boolean,separated = false){
    super();
    if(separated){
      this.lastSeparatorIndex = -1;
    }
  }
  protected initializeLookup(){
    this.processorLookup.add(
      ['.',this.processDecimalPoint],
      [['e','E'],this.processFloatExponent],
      ['n',this.processBigInt],
      [digitsArray,this.processDigit]
    );
  }
  
  private getCharsWithSign(){
    return (this.negative?'-':'') + this.chars
  }
  private getDecimalResult(){
    const charsWithSign = this.getCharsWithSign();
    return {
      //@ts-ignore
      value:this.bigInt?BigInt(charsWithSign):parseInt(charsWithSign,10),
      delimitingChar:this.delimitingChar
    }
  }
  getCompleted(): ValueOnlyResult {
    return this.floatResult??this.getDecimalResult();
  }
  stackCompleted(parser: IValueOnlyParser): ProcessResult {
    this.floatResult = parser.getCompleted();
    return ProcessResult.Completed;
  }
  
  private processFloatExponent():ProcessResult.Continue|ProcessResult.Break{
    if(this.lastCharASeparator()){
      return ProcessResult.Break;
    }
    this.chars+='e';
    this.stackManager.setCurrent(FloatParser.Exponent(this.getCharsWithSign()));
    return ProcessResult.Continue;
  }
  private processDecimalPoint(){
    if(this.lastCharASeparator()){
      return ProcessResult.Break;
    }
    this.chars+='.';
    this.stackManager.setCurrent(FloatParser.DecimalPoint(this.getCharsWithSign()));
    return ProcessResult.Continue;
  }
  private processBigInt(){
    if(this.lastCharASeparator()) return ProcessResult.Break;
    this.bigInt = true;
    return ProcessResult.Completed;
  }
  private processDigit(digit:string){
    this.chars+=digit;
    return ProcessResult.Continue;
  }
  
  //0_ - don't need to keep the 0
  static Separated(stackManager:StackManager,negative:boolean):FloatOrDecimalParser{
    const floatOrDecimalParser = new FloatOrDecimalParser(stackManager,'', negative);
    floatOrDecimalParser.lastSeparatorIndex = -1;
    return floatOrDecimalParser;
  }
  static Number(stackManager:StackManager,numberChar:OneToNine, negative=false){
    const floatOrDecimalParser = new FloatOrDecimalParser(stackManager, numberChar, negative);
    return floatOrDecimalParser;
  }
}