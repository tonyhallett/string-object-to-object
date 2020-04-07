import { Parser, ProcessResult } from "./stringToObjectParser";
import { stackCompletedError } from "./value/valueOnly/common";

export interface PropertyIdentifierResult{
  property:string,
  delimitingChar:string
}
export interface IPropertyIdentifierParser extends Parser{
  type: 'PropertyIdentifier';
  getCompleted:() => PropertyIdentifierResult
}
export class PropertyIdentifierParser implements IPropertyIdentifierParser {
  private identifier: string;
  private delimitingChar!: string;
  type: 'PropertyIdentifier' = 'PropertyIdentifier';
  constructor(firstChar: string) {
    this.identifier = firstChar;
  }
  firstCharIsValid(): boolean {
    return !!/[a-z|A-Z]|_|\$/.exec(this.identifier);
  }
  getCompleted(): PropertyIdentifierResult {
    return {
      property: this.identifier,
      delimitingChar: this.delimitingChar
    };
  }
  stackCompleted(_: Parser): ProcessResult {
    throw stackCompletedError;
  }
  
  process(char: string): ProcessResult {
    return this.processDelimitingChar(char)??this.addToIdentifier(char);
  }
  private processDelimitingChar(char:string){
    if (char === '/' || char === ':' || char.trim() === '') {
      this.delimitingChar = char;
      return ProcessResult.Completed;
    }
  }
  private addToIdentifier(char:string){
    this.identifier += char;
    return ProcessResult.Continue;
  }
}
