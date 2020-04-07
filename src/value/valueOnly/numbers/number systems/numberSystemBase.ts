import { ValueOnlyResult } from "../../IValueOnlyParser";
import { Parser, ProcessResult } from "../../../../stringToObjectParser";
import { stackCompletedError } from "../../common";
import { SeparatedNumberParser } from "../separatedBase/separatedNumberParser";

export class NumberSystemBase extends SeparatedNumberParser{
  private isBigInt = false;
  numberChars = '';
  constructor(private readonly radix:2|8|16,private readonly acceptableUppercaseChars:string[],private readonly negative:boolean,private readonly allowSeparator = true){
    super();
  }
  private getNumberSystem(){
    switch(this.radix){
      case 2:
        return '0b';
      case 8:
        return '0o';
      case 16:
        return '0x';
    }
  }
  private getFullNumber(){
    return (this.negative?'-':'') + this.getNumberSystem() + this.numberChars;
  }
  private getNumberCharsWithSign(){
    return (this.negative?'-':'') + this.numberChars;
  }
  getCompleted(): ValueOnlyResult {
    let value:bigint|number;
    if(this.isBigInt){
      //@ts-ignore
      value = BigInt(this.getFullNumber());
    }else{
      value = parseInt(this.getNumberCharsWithSign(), this.radix);
    }
    const result = {
      value,
      delimitingChar:this.delimitingChar
    }
    return result;
  }
  processAllowed(char: string): ProcessResult | undefined {
    return this.processBigInt(char)??this.processAcceptableUppercaseChars(char);
  }
  private processBigInt(char:string){
    if(char === 'n'){
      if(this.numberChars.length===0||this.lastCharASeparator()){
        return ProcessResult.Break;
      }
      this.isBigInt = true;
      return ProcessResult.Completed;
    }
  }
  private processAcceptableUppercaseChars(char:string){
    if(this.acceptableUppercaseChars.indexOf(char.toUpperCase())!==-1){
      this.numberChars+=char;
      return ProcessResult.Continue;
    }
  }
  protected separatorAllowed(){
    return this.allowSeparator&&this.numberChars.length!==0;
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
}
