import { Parser, ProcessResult } from "../stringToObjectParser";
import { stackCompletedError } from "../value/valueOnly/common";

export interface QuoteResult{
  property:string
}
export interface IQuoteParser extends Parser{
  type: 'Quote';
  getCompleted():QuoteResult
}
export class QuoteParser implements IQuoteParser {
  type: 'Quote' = 'Quote';
  private quoteChar: "'" | '"';
  private quoted = '';
  private lastEscape = false;
  constructor(single: boolean) {
    this.quoteChar = single ? "'" : '"';
  }
  
  process(char: string): ProcessResult {
    if (char === this.quoteChar && !this.lastEscape) {
      return ProcessResult.Completed;
    }
    if(char === '\\'){
      this.lastEscape = true;
      return ProcessResult.Continue;
    }
    if(char.charCodeAt(0)===10){
      if(this.lastEscape){
        this.quoted+='\n';
        return ProcessResult.Continue;
      }
      return ProcessResult.Break;
    }
    if(this.lastEscape&&char !== this.quoteChar){
      this.quoted+="\\";
    }
    this.quoted+=char;
        
    this.lastEscape = false;
    return ProcessResult.Continue;
  }
  getCompleted(): QuoteResult {
    var charmap = {
      n: "\n",
      r: "\r",
      f: "\f",
      t: "\t",
      b: "\b",
      v: "\v"
    } as any;
    var replaced = this.quoted.replace(/\\(.)/g, function(_, char) {
      return (char in charmap) ? charmap[char] : char;
    });
    return { property: replaced };
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
  
}
