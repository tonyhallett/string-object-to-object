import { IValueOnlyParser, ValueOnlyResult } from "../../IValueOnlyParser";
import { Parser, ProcessResult } from "../../../../stringToObjectParser";

export abstract class SeparatedNumberParser implements IValueOnlyParser{
  private charIndex = -1;
  protected lastSeparatorIndex:number|undefined;
  protected delimitingChar:string|undefined
  type: "ValueOnly" = 'ValueOnly';

  abstract getCompleted():ValueOnlyResult 
  process(char: string): ProcessResult {
    this.charIndex++;
    return this.processSeparator(char)??this.processAllowed(char)??this.processDelimiter(char);
  }
  private processSeparator(char:string):ProcessResult|undefined{
    if(char==='_'){
      //cannot have __
      const result = this.lastCharASeparator()||!this.separatorAllowed() ?ProcessResult.Break:ProcessResult.Continue;
      this.lastSeparatorIndex = this.charIndex;
      return result;
    }
  }
  private processDelimiter(char:string){
    if(this.lastCharASeparator()) return ProcessResult.Break;
    this.delimitingChar = char;
    return this.delimitedCompletedState()?ProcessResult.Completed:ProcessResult.Break;
  }
  protected delimitedCompletedState():boolean{
    return true;
  }
  protected separatorAllowed():boolean{
    return true;
  } 
  abstract processAllowed(char:string):ProcessResult|undefined;
  abstract stackCompleted(parser: Parser):ProcessResult
  protected lastCharASeparator(){
    return this.lastSeparatorIndex===this.charIndex -1;
  }

}
