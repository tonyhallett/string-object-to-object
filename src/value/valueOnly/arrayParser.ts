import { IValueOnlyParser, ValueOnlyResult } from "./IValueOnlyParser";
import { Parser, StackManager, ProcessResult } from "../../stringToObjectParser";
import { ValueParser, IValueParser, ValueResult } from "../ValueParser";
import { processError } from "./common";
import { CommentAndWhitespaceParser, ICommentAndWhitespaceParser } from "../../common/CommentAndWhitespaceParser";

export class ArrayParser implements IValueOnlyParser{
  type: "ValueOnly" = 'ValueOnly';
  stackParser: Parser
  array: Array<any> = [];
  getCompleted(): ValueOnlyResult {
    return {
      delimitingChar:undefined,
      value:this.array
    }
  }
  process(char: string): ProcessResult {
    throw processError;
  }
  stackCompleted(parser: ICommaOrValueParser):ProcessResult {
    const result = parser.getCompleted();
    if(result.closingBracket){
      return ProcessResult.Completed;
    }
    if(result.comma){
      this.array.push(undefined);
      return this.lookForMoreEntries();
    }
    const valueResult = result.value!;
    this.array.push(valueResult.value);
    if(valueResult.finalChar === ']'){
      return ProcessResult.Completed;
    }
    return this.lookForMoreEntries();
  }
  lookForMoreEntries(){
    this.stackManager.setCurrent(new CommaBracketOrValueParser(this.stackManager));
    return ProcessResult.Continue;
  }
  constructor(private readonly stackManager:StackManager){
    this.stackParser = new CommaBracketOrValueParser(stackManager);
  }
}
export interface CommaOrBracketValueResult{
  comma?:true,
  value?:ValueResult<']'>,
  closingBracket?:true
}
export interface ICommaOrValueParser extends Parser{
  type:'CommaOrValue'
  getCompleted():CommaOrBracketValueResult
}
type CommaOrValueStackParsers = ICommentAndWhitespaceParser | IValueParser<']'>;
class CommaBracketOrValueParser implements ICommaOrValueParser{
  type: "CommaOrValue" = 'CommaOrValue';
  result!:CommaOrBracketValueResult
  getCompleted(): CommaOrBracketValueResult {
    return this.result;
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  stackCompleted(parser: CommaOrValueStackParsers): ProcessResult {
    if(parser.type === 'CommentAndWhitespace'){
      const nonWhitespaceChar = parser.getCompleted().nonWhitespaceChar;
      switch(nonWhitespaceChar){
        case ',':
          this.result = {comma:true}
          return ProcessResult.Completed;
        case ']':
          this.result = {closingBracket:true}
          return ProcessResult.Completed;
        default:
          const valueParser = new ValueParser(this.stackManager, ']',nonWhitespaceChar);
          if(valueParser.initialCharValid){
            this.stackManager.setCurrent(valueParser);
            return ProcessResult.Continue;
          }
          return ProcessResult.Break;
      }
    }else{
      this.result = {value: parser.getCompleted()};
      return ProcessResult.Completed;
    }
    
  }
  stackParser?: Parser | undefined;
  constructor(private readonly stackManager:StackManager){
    this.stackParser = new CommentAndWhitespaceParser(stackManager);
  }

}
