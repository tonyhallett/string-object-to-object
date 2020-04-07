import { Parser, ProcessResult } from "../stringToObjectParser";
export interface ICommentParser extends Parser{
  type:'Comment',
  getCompleted:() => void
}
enum CommentParserState {Initial,Single, Multiple, MultipleLastAsterisk}
export class CommentParser implements ICommentParser {
  state = CommentParserState.Initial;
  process(char: string): ProcessResult {
    switch(this.state){
      case CommentParserState.Initial:
        if(char==='/'){
          this.state = CommentParserState.Single;
          return ProcessResult.Continue;
        }
        if(char==='*'){
          this.state = CommentParserState.Multiple;
          return ProcessResult.Continue;
        }
        return ProcessResult.Break
      case CommentParserState.Single:
        if(char === '\n'){
          return ProcessResult.Completed;
        }
        return ProcessResult.Continue;
      case CommentParserState.Multiple:
        if(char === '*'){
          this.state = CommentParserState.MultipleLastAsterisk;
        }
        return ProcessResult.Continue;
      case CommentParserState.MultipleLastAsterisk:
        if(char === '/'){
          return ProcessResult.Completed;
        }
        if(char !== '*'){
          this.state = CommentParserState.Multiple;
        }
        return ProcessResult.Continue;
    }
  }
  getCompleted() { }
  stackCompleted(parser: Parser): ProcessResult {
    throw new Error("Method not implemented.");
  }
  constructor(initialChar?:'/'|'*'){
    if(initialChar === '/'){
      this.state = CommentParserState.Single;
    }else if(initialChar === '*'){
      this.state = CommentParserState.Multiple;
    }
  }
  type: 'Comment' = 'Comment';
}
