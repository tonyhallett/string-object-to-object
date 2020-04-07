import { Parser, StackManager, ProcessResult } from "../stringToObjectParser";
import { WhitespaceParser, IWhitespaceParser } from "../common/WhitespaceParser";
import { CommentParser, ICommentParser } from "../common/CommentParser";
export type CommentRegexAndWhitespaceStackParsers = IWhitespaceParser | ICommentParser
export interface CommentRegexAndWhitespaceResult{
  nonWhitespaceChar:string,
  possibleRegex?:true
}

export interface ICommentRegexAndWhitespaceParser extends Parser{
  type: 'CommentRegexAndWhitespace'
  getCompleted():CommentRegexAndWhitespaceResult
}
export class CommentRegexAndWhitespaceParser implements ICommentRegexAndWhitespaceParser {
  type: "CommentRegexAndWhitespace" = 'CommentRegexAndWhitespace';
  result!: CommentRegexAndWhitespaceResult;
  constructor(private readonly stackManager: StackManager) {
    this.stackParser = new WhitespaceParser();
  }
  getCompleted(): CommentRegexAndWhitespaceResult {
    return this.result;
  }
  process(char: string): ProcessResult {
    if (char === '/' || char === '*') {
      this.stackManager.setCurrent(new CommentParser(char));
      return ProcessResult.Continue;
    }
    this.result = {
      nonWhitespaceChar: char,
      possibleRegex: true
    };
    return ProcessResult.Continue;
  }
  stackCompleted(parser: CommentRegexAndWhitespaceStackParsers): ProcessResult {
    switch (parser.type) {
      case 'Whitespace':
        const nonWhitespaceChar = parser.getCompleted().nonWhitespaceChar;
        if (nonWhitespaceChar === '/') {
          //process
          return ProcessResult.Continue;
        }
        this.result = {
          nonWhitespaceChar
        };
        return ProcessResult.Completed;
      case "Comment":
        this.stackManager.setCurrent(new WhitespaceParser());
        return ProcessResult.Continue;
    }
  }
  stackParser?: Parser | undefined;
}
