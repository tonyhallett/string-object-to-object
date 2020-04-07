import { Parser, ProcessResult } from "../stringToObjectParser";
import { stackCompletedError } from "../value/valueOnly/common";

export interface WhitespaceResult{
  nonWhitespaceChar:string
}
export interface IWhitespaceParser extends Parser{
  type: 'Whitespace';
  getCompleted():WhitespaceResult
}
export class WhitespaceParser implements IWhitespaceParser {
  nonWhitespaceChar!: string;
  process(char: string): ProcessResult {
    if (char.trim() === '') {
      return ProcessResult.Continue;
    }
    this.nonWhitespaceChar = char;
    return ProcessResult.Completed;
  }
  getCompleted(): WhitespaceResult {
    return { nonWhitespaceChar: this.nonWhitespaceChar };
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
  type: 'Whitespace' = 'Whitespace';
}
