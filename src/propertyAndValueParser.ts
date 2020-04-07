import { StackManager, Parser, ProcessResult } from "./stringToObjectParser";
import { ColonParser, IColonParser } from "./ColonParser";
import { PropertyParser, IPropertyParser, PropertyResult } from "./PropertyParser";
import { IValueParser, ValueResult, ValueParser } from "./value/ValueParser";
import { processError } from "./value/valueOnly/common";

export interface PropertyAndValueResult{
  name:string,
  value:any,
  finalChar:'Comma'|'ClosingCurly',
  closingCurly?:true
}
type PropertyAndValueStackParsers = IPropertyParser|IColonParser|IValueParser
export class PropertyAndValueParser implements Parser {
  private name!: string;
  private valueResult!:ValueResult<'}'>;
  private closingCurly = false;
  type = 'PropertyValue';
  stackParser!:Parser
  constructor(private readonly stackManager: StackManager) { 
    this.stackParser = new PropertyParser(stackManager);
  }
  process(_: string): ProcessResult {
    throw processError;
  }
  getCompleted():PropertyAndValueResult {
    if(this.closingCurly){
      return {
        closingCurly:true
      } as any;
    }
    return {
      name:this.name,
      value:this.valueResult.value,
      finalChar:this.valueResult.finalChar===','?'Comma':'ClosingCurly'
    };
  }
  stackCompleted(parser: PropertyAndValueStackParsers): ProcessResult {
    switch(parser.type){
      case 'Property':
        return this.propertyCompleted(parser.getCompleted());
      case 'Colon':
        return this.continueWithValueParser();
      case 'Value':
        this.valueResult = parser.getCompleted();
        return ProcessResult.Completed;
    }
  }
  private propertyCompleted(propertyResult:PropertyResult){
    if(propertyResult.curlyBrace){
      this.closingCurly = true;
      return ProcessResult.Completed;
    }
    this.name = propertyResult.property;
    return this.propertyFoundContinuation(propertyResult.delimitingChar);
  }
  private propertyFoundContinuation(delimitingChar:string){
    if(delimitingChar===':'){
      return this.continueWithValueParser();
    }
    this.stackManager.setCurrent(new ColonParser(this.stackManager,delimitingChar));
    return ProcessResult.Continue;
  }
  private continueWithValueParser(){
    this.stackManager.setCurrent(new ValueParser(this.stackManager,'}'));
    return ProcessResult.Continue;
  }
}
