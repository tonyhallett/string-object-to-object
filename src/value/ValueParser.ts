import { Parser, StackManager, ProcessResult } from "../stringToObjectParser";
import { ICommentAndWhitespaceParser, CommentAndWhitespaceParser } from "../common/CommentAndWhitespaceParser";
import { IValueOnlyParser, ValueOnlyResult } from "./valueOnly/IValueOnlyParser";
import { IValueCloseParser, ValueCloseParser } from "../ValueCloseParser";
import { TrueParser } from "./valueOnly/word parsers/TrueParser";
import { FalseParser } from "./valueOnly/word parsers/FalseParser";
import { UndefinedParser } from "./valueOnly/word parsers/UndefinedParser";
import { NullParser } from "./valueOnly/word parsers/NullParser";
import { QuoteValueParser } from "./valueOnly/QuoteValueParser";
import { NumberParser } from "./valueOnly/numbers/numberParser";
import { FloatOrDecimalParser } from "./valueOnly/numbers/floatOrDecimalParser";
import { FloatParser } from "./valueOnly/numbers/floatParser";
import { TValueClosingChars, ClosingChars, processError } from "./valueOnly/common";
import { ArrayParser } from "./valueOnly/arrayParser";
import { CharProcessor, CharProcessorLookup } from "./valueOnly/numbers/common";
import { ObjectLiteralParser } from "./valueOnly/objectLiteralParser";

export interface ValueResult<TClosing extends TValueClosingChars>{
  value:any,
  finalChar:ClosingChars<TClosing>
}
export interface IValueParser<TClosing extends TValueClosingChars = any> extends Parser {
  type: 'Value';
  getCompleted(): ValueResult<TClosing>;
}

type ValueStackParsers = ICommentAndWhitespaceParser|IValueOnlyParser|IValueCloseParser

export type ParserCreator<T extends string|string[]> = CharProcessor<T, Parser>

export class ValueParser<TClosing extends TValueClosingChars> implements IValueParser<TClosing>{
  private parserLookup:CharProcessorLookup<Parser> = new CharProcessorLookup<Parser>();
  private value:any;
  private valueResult!:ValueResult<TClosing>
  type:'Value' = "Value";
  stackParser!:Parser
  initialCharValid?:true
  constructor(private readonly stackManager: StackManager,private readonly closingChar:TClosing, initialChar?:string) { 
    this.initializeLookup();
    this.initializeStackParser(initialChar);
    
  }
  private initializeLookup(){
    this.parserLookup.add(
      ['t', () => new TrueParser()],
      ['f', () => new FalseParser()],
      ['u', () => new UndefinedParser()],
      ['n', () => new NullParser()],
      ['[', () => new ArrayParser(this.stackManager) ],
      ['{', () => new ObjectLiteralParser(this.stackManager)],
      ['/', () => { throw new Error('not implemented')}],
      ['.', () => FloatParser.DecimalPoint('.')],
      ['0', () => NumberParser.Zero(this.stackManager)],
    )
    const signedNumberCreator:ParserCreator<['+','-']> = [['+','-'], (plusOrMinus)=> NumberParser.Signed(plusOrMinus==='+'?false:true,this.stackManager)]
    const quoteParserCreator:ParserCreator<['"',"'","`"]> = [['"',"'","`"], (quote)=>new QuoteValueParser(quote,this.stackManager)]
    const floatOrDecimalParser:ParserCreator<['1','2','3','4','5','6','7','8','9']> = [['1','2','3','4','5','6','7','8','9'], (numberChar => FloatOrDecimalParser.Number(this.stackManager,numberChar))]
    this.parserLookup.add(signedNumberCreator,quoteParserCreator,floatOrDecimalParser);
  }
  private initializeStackParser(initialChar:string|undefined){
    if(initialChar){
      const parserCreator = this.parserLookup.get(initialChar);
      if(parserCreator){
        this.stackParser = parserCreator(initialChar);
        this.initialCharValid = true;
      }
    }else{
      this.stackParser = new CommentAndWhitespaceParser(this.stackManager);
    }
  }
  
  getCompleted(): ValueResult<TClosing> {
    return this.valueResult;   
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  stackCompleted(parser: ValueStackParsers): ProcessResult {
    switch(parser.type){
      case 'CommentAndWhitespace':
        return this.processCommentAndWhitespaceCompleted(parser.getCompleted().nonWhitespaceChar);
      case 'ValueOnly':
        return this.processValueOnlyCompleted(parser.getCompleted());
      case 'ValueClose':
        this.valueResult = {
          value:this.value,
          finalChar:parser.getCompleted().closingChar
        }
        return ProcessResult.Completed;
    }
  }
  private processCommentAndWhitespaceCompleted(nonWhitespaceChar:string):ProcessResult{
    const parserCreator = this.parserLookup.get(nonWhitespaceChar);
    if(parserCreator){
      this.stackManager.setCurrent(parserCreator(nonWhitespaceChar));
      return ProcessResult.Continue;
    }
    return ProcessResult.Break;
  }
  private processValueOnlyCompleted(valueOnlyResult:ValueOnlyResult):ProcessResult{
    const delimitingChar = valueOnlyResult.delimitingChar;
    if(delimitingChar===','||delimitingChar === this.closingChar){
      this.valueResult = {
        value : valueOnlyResult.value,
        finalChar:delimitingChar as any
      }
      return ProcessResult.Completed;
    }
    if(delimitingChar && delimitingChar.trim()!==''){
      return ProcessResult.Break;
    }
    this.value = valueOnlyResult.value;
    this.stackManager.setCurrent(new ValueCloseParser(this.stackManager, this.closingChar));
    return ProcessResult.Continue;
  }
  
}
