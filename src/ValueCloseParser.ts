import { StackManager, Parser, ProcessResult } from "./stringToObjectParser";
import { CommentAndWhitespaceParser } from "./common/CommentAndWhitespaceParser";
import { TValueClosingChars, ClosingChars, processError } from "./value/valueOnly/common";

export interface ValueCloseResult<TClosing extends TValueClosingChars>{
  closingChar:ClosingChars<TClosing>
}
export interface IValueCloseParser<TClosing extends TValueClosingChars=any> extends Parser{
  type:'ValueClose',
  getCompleted():ValueCloseResult<TClosing>;
}
export class ValueCloseParser<TClosing extends TValueClosingChars> implements IValueCloseParser<TClosing> {
  type: "ValueClose" = 'ValueClose';
  closingChar!: ClosingChars<TClosing>
  getCompleted(): ValueCloseResult<TClosing> {
    return {
      closingChar: this.closingChar
    };
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  stackCompleted(parser: CommentAndWhitespaceParser): ProcessResult {
    const nonWhitespaceChar = parser.getCompleted().nonWhitespaceChar;
    if (nonWhitespaceChar === ','|| nonWhitespaceChar === this.additionalClosingChar) {
      this.closingChar = nonWhitespaceChar as any;
      return ProcessResult.Completed;
    }
    return ProcessResult.Break;
  }
  completeWithClosing(closingChar: ClosingChars<TClosing>) {
    this.closingChar = closingChar;
    return ProcessResult.Completed;
  }
  constructor(stackManager: StackManager, private readonly additionalClosingChar:TClosing) {
    this.stackParser = new CommentAndWhitespaceParser(stackManager);
  }
  stackParser!: Parser;
}
