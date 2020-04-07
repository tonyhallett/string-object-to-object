import { Parser, ProcessResult } from "../stringToObjectParser";
import { IValueOnlyParser, ValueOnlyResult } from "./valueOnly/IValueOnlyParser";
export class RegexParser implements IValueOnlyParser {
  type: "ValueOnly" = 'ValueOnly';
  getCompleted(): ValueOnlyResult {
    throw new Error("Method not implemented.");
  }
  process(char: string): ProcessResult {
    throw new Error("Method not implemented.");
  }
  stackCompleted(parser: Parser): ProcessResult {
    throw new Error("Method not implemented.");
  }
  stackParser?: Parser | undefined;
  constructor(private initialChar: string) { }
}
