import { StackManager, Parser, ProcessResult } from "./stringToObjectParser";
import { CommentAndWhitespaceParser } from "./common/CommentAndWhitespaceParser";
import { processError } from "./value/valueOnly/common";

export interface IColonParser extends Parser{
  type:'Colon'
  getCompleted():void
}
export class ColonParser implements IColonParser {
  type: 'Colon' = 'Colon';
  stackParser!: Parser;
  constructor(stackManager: StackManager, lastChar: string) {
    //last char will either be undefined for quotes or / or whitespace for property identifier
    this.stackParser = new CommentAndWhitespaceParser(stackManager, lastChar);
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  getCompleted() {
  }
  stackCompleted(parser: CommentAndWhitespaceParser): ProcessResult {
    const nonWhiteSpaceChar = parser.getCompleted().nonWhitespaceChar;
    if (nonWhiteSpaceChar === ':') {
      return ProcessResult.Completed;
    }
    return ProcessResult.Break;
  }
}
