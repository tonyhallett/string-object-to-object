import { Parser, ProcessResult } from "../../../stringToObjectParser";
import { IValueOnlyParser, ValueOnlyResult } from "../IValueOnlyParser";
import { stackCompletedError } from "../common";

export class WordParser implements IValueOnlyParser {
  type: "ValueOnly" = 'ValueOnly';
  private completedLength = 1;
  private keywordLength: number;
  constructor(private keyword: string, private value: any) {
    this.keywordLength = keyword.length;
  }
  getCompleted(): ValueOnlyResult {
    return {
      delimitingChar: undefined,
      value: this.value
    };
  }
  process(char: string): ProcessResult {
    if (this.keyword.charAt(this.completedLength) !== char) {
      return ProcessResult.Break;
    }
    this.completedLength++;
    if (this.completedLength === this.keywordLength) {
      return ProcessResult.Completed;
    }
    return ProcessResult.Continue;
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
}
