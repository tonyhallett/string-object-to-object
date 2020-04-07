import { StackManager, Parser, ProcessResult } from "./stringToObjectParser";
import { CommentAndWhitespaceParser, ICommentAndWhitespaceParser } from "./common/CommentAndWhitespaceParser";
import { PropertyIdentifierParser } from "./PropertyIdentifierParser";
import { QuoteParser, IQuoteParser } from "./common/QuoteParser";
import { processError } from "./value/valueOnly/common";

export type PropertyParserStackParsers = ICommentAndWhitespaceParser|IQuoteParser|PropertyIdentifierParser

export interface PropertyResult{
  property:string,
  delimitingChar:string,
  curlyBrace?:true
}
export interface IPropertyParser extends Parser{
  type:'Property';
  getCompleted():PropertyResult
}

export class PropertyParser implements IPropertyParser {
  private propertyParserResult!: PropertyResult;
  type: 'Property' = 'Property';
  stackParser!: Parser;
  constructor(private readonly stackManager: StackManager) {
    this.stackParser = new CommentAndWhitespaceParser(stackManager);
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  getCompleted(): PropertyResult {
    return this.propertyParserResult;
  }
  stackCompleted(parser: PropertyParserStackParsers): ProcessResult {
    switch (parser.type) {
      case 'CommentAndWhitespace':
        return this.commentAndWhitespaceCompleted(parser.getCompleted().nonWhitespaceChar);
      case 'PropertyIdentifier':
        this.propertyParserResult = parser.getCompleted();
        return ProcessResult.Completed;
      case 'Quote':
        this.propertyParserResult = {
          delimitingChar: '',
          property: parser.getCompleted().property
        };
        return ProcessResult.Completed;
    }
  }
  private commentAndWhitespaceCompleted(nonWhitespaceChar:string){
    return this.closingCurlyFound(nonWhitespaceChar) ??
      this.quoteFound(nonWhitespaceChar) ??
      this.processIdentifier(nonWhitespaceChar);
  }
  private closingCurlyFound(char:string){
    if (char ==='}'){
      this.propertyParserResult = {delimitingChar:'',property:'',curlyBrace:true};
      return ProcessResult.Completed;
    }
  }
  private quoteFound(char:string){
    if (char === "'") {
      this.stackManager.setCurrent(new QuoteParser(true));
      return ProcessResult.Continue;
    }
    if (char === '"') {
      this.stackManager.setCurrent(new QuoteParser(false));
      return ProcessResult.Continue;
    }
  }
  private processIdentifier(nonWhitespaceChar:string){
    const propertyIdentifier = new PropertyIdentifierParser(nonWhitespaceChar);
    if (propertyIdentifier.firstCharIsValid()) {
      this.stackManager.setCurrent(propertyIdentifier);
      return ProcessResult.Continue;
    }
    else {
      return ProcessResult.Break;
    }
  }
}
