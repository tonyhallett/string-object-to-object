import { Parser, ProcessResult } from "../../stringToObjectParser";
import { stackCompletedError } from "./common";
export interface BacktickParserResult{
  quoted:string
}
export interface IBacktickParser extends Parser{
  type:'Backtick',
  getCompleted():BacktickParserResult
}
export class BacktickParser implements IBacktickParser {
  type: "Backtick" = 'Backtick';
  private quoted = '';
  private lastEscape = false;
  getCompleted(): BacktickParserResult {
    var charmap = {
      n: "\n",
      r: "\r",
      f: "\f",
      t: "\t",
      b: "\b",
      v: "\v"
    } as any;
    var replaced = this.quoted.replace(/\\(.)/g, function (_, char) {
      return (char in charmap) ? charmap[char] : char;
    });
    return { quoted: replaced };
  }
  process(char: string): ProcessResult {
    if (char === '`' && !this.lastEscape) {
      return ProcessResult.Completed;
    }
    if (char === '\\') {
      this.lastEscape = true;
      return ProcessResult.Continue;
    }
    if (this.lastEscape && char !== '`') {
      this.quoted += "\\";
    }
    this.quoted += char;
    this.lastEscape = false;
    return ProcessResult.Continue;
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
  stackParser?: Parser | undefined;
}
