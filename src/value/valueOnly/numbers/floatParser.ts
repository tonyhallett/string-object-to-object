import { ValueOnlyResult } from "../IValueOnlyParser";
import { Parser, ProcessResult } from "../../../stringToObjectParser";
import { digitsArray, stackCompletedError } from "../common";
import { SeparatedNumberLookupParser } from "./separatedBase/separatedNumberLookupParser";

enum FloatParserState {DecimalPoint,DecimalPointDigits, Exponent, ExponentSigned, ExponentDigits}
export class FloatParser extends SeparatedNumberLookupParser{
  constructor(private chars:string,private state:FloatParserState){
    super();
  }
  initializeLookup(){
    this.processorLookup.add(
      ['.', ()=> ProcessResult.Break],
      [['e','E'], this.processExponent],
      [['+','-'], this.processSign],
      [digitsArray, this.processDigit]
    )
  }
  
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
  getCompleted(): ValueOnlyResult {
    const result = {
      value:parseFloat(this.chars),
      delimitingChar:this.delimitingChar
    }
    return result;
  }
  protected separatorAllowed(){
    return this.state===FloatParserState.DecimalPointDigits||this.state === FloatParserState.ExponentDigits;
  }
  private processExponent():ProcessResult.Continue|ProcessResult.Break{
    if(this.lastCharASeparator()){
      return ProcessResult.Break;
    }
    if(this.state === FloatParserState.DecimalPoint||this.state === FloatParserState.DecimalPointDigits){
      this.state = FloatParserState.Exponent;
      this.chars+='e';
      return ProcessResult.Continue;
    }
    return ProcessResult.Break;
  }
  private processSign(sign:string):ProcessResult.Continue|ProcessResult.Break{
    if(this.state === FloatParserState.Exponent){
      this.state = FloatParserState.ExponentSigned;
      this.chars +=sign;
      return ProcessResult.Continue;
    }
    return ProcessResult.Break;
  }
  private processDigit(digit:string):ProcessResult.Continue {
    this.chars+=digit;
    if(this.state === FloatParserState.DecimalPoint){
      this.state = FloatParserState.DecimalPointDigits;
    }
    if(this.state === FloatParserState.Exponent || this.state === FloatParserState.ExponentSigned){
      this.state = FloatParserState.ExponentDigits;
    }
    return ProcessResult.Continue
  }
  protected delimitedCompletedState(){
    return !(this.state===FloatParserState.DecimalPoint||
      this.state === FloatParserState.Exponent || 
      this.state === FloatParserState.ExponentSigned);
  }
  static DecimalPoint(charOrChars:string):FloatParser{
    const floatParser = new FloatParser(charOrChars,FloatParserState.DecimalPoint)
    return floatParser;
  }
  static Exponent(chars:string):FloatParser{
    const floatParser = new FloatParser(chars,FloatParserState.Exponent)
    return floatParser;
  }
}