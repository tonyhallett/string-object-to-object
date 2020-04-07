import { Parser, ProcessResult, StackManager } from "../../stringToObjectParser";
import { IValueOnlyParser, ValueOnlyResult } from "./IValueOnlyParser";
import { QuoteParser, IQuoteParser } from "../../common/QuoteParser";
import { processError } from "./common";
import { BacktickParser, IBacktickParser } from "./BacktickParser";
import { ICommentAndWhitespaceParser, CommentAndWhitespaceParser } from "../../common/CommentAndWhitespaceParser";

type QuoteValueStackParsers = IBacktickParser | IQuoteParser | ICommentAndWhitespaceParser
export class QuoteValueParser implements IValueOnlyParser {
  private quoted: string ='';
  private delimitingChar:string |undefined;
  type: "ValueOnly" = 'ValueOnly';
  stackParser!: Parser;
  constructor(quote:'"'|"'"|"`", private readonly stackManager:StackManager) {
    if(quote==='`'){
      this.stackParser = new BacktickParser();
    }else{
      this.stackParser = new QuoteParser(quote==="'"?true:false);
    }
  }
  
  getCompleted(): ValueOnlyResult {
    return {
      value: `${this.quoted}`,
      delimitingChar: this.delimitingChar
    };
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  private processingPlus = false;
  stackCompleted(parser: QuoteValueStackParsers): ProcessResult {
    switch(parser.type){
      case 'Backtick':
        this.quoted+= parser.getCompleted().quoted;
        this.stackManager.setCurrent(new CommentAndWhitespaceParser(this.stackManager));
        return ProcessResult.Continue;
      case 'Quote':
        this.quoted+= parser.getCompleted().property;
        this.stackManager.setCurrent(new CommentAndWhitespaceParser(this.stackManager));
        return ProcessResult.Continue;
      case 'CommentAndWhitespace':
        const nonWhitespaceChar = parser.getCompleted().nonWhitespaceChar;
        this.delimitingChar = nonWhitespaceChar;
        if(this.processingPlus){
          this.processingPlus = false;
          switch(nonWhitespaceChar){
            case '"':
              this.stackManager.setCurrent(new QuoteParser(false));
              return ProcessResult.Continue;
            case "'":
              this.stackManager.setCurrent(new QuoteParser(true));
              return ProcessResult.Continue;
            case '`':
              this.stackManager.setCurrent(new BacktickParser());
              return ProcessResult.Continue;
            default:
              return ProcessResult.Break;
          }
        }else{
          if(nonWhitespaceChar==='+'){
            this.stackManager.setCurrent(new CommentAndWhitespaceParser(this.stackManager));
            this.processingPlus = true;
            return ProcessResult.Continue;
          }
          return ProcessResult.Completed;
        }
        
    }
    
    
  }
}
