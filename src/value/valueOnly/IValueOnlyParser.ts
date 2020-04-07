import { Parser } from "../../stringToObjectParser";

export interface ValueOnlyResult{
  delimitingChar:string|undefined,
  value:any
}
export interface IValueOnlyParser extends Parser {
  type: 'ValueOnly';
  getCompleted(): ValueOnlyResult;
}
