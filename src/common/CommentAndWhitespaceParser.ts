import { StackManager, Parser, ProcessResult } from "../stringToObjectParser";
import { CommentParser, ICommentParser } from "./CommentParser";
import { WhitespaceParser, IWhitespaceParser } from "./WhitespaceParser";
import { processError } from "../value/valueOnly/common";

export interface CommentAndWhiteSpaceResult{
  nonWhitespaceChar:string
}
export interface ICommentAndWhitespaceParser extends Parser{
  type:'CommentAndWhitespace'
  getCompleted:() => CommentAndWhiteSpaceResult
}
export type CommentAndWhitespaceStackParsers = ICommentParser|IWhitespaceParser
export class CommentAndWhitespaceParser implements ICommentAndWhitespaceParser {
  private nonWhitespaceChar!: string;
  type: 'CommentAndWhitespace' = 'CommentAndWhitespace';
  stackParser: Parser | undefined;
  constructor(private readonly stackManager: StackManager, lastChar?: string) {
    if (lastChar === '/') {
      this.stackParser = new CommentParser();
    }else{
      this.stackParser = new WhitespaceParser();
    }
  }
  
  process(_: string): ProcessResult {
    throw processError;
  }
  getCompleted(): CommentAndWhiteSpaceResult {
    return {
      nonWhitespaceChar: this.nonWhitespaceChar
    };
  }
  stackCompleted(parser: CommentAndWhitespaceStackParsers): ProcessResult {
    switch (parser.type) {
      case 'Whitespace':
        const nonWhitespaceChar = parser.getCompleted().nonWhitespaceChar;
        if (nonWhitespaceChar === '/') {
          this.stackManager.setCurrent(new CommentParser());
          return ProcessResult.Continue;
        }
        this.nonWhitespaceChar = nonWhitespaceChar;
        return ProcessResult.Completed;
      case 'Comment':
        this.stackManager.setCurrent(new WhitespaceParser());
        return ProcessResult.Continue;
    }
  }
  
}
