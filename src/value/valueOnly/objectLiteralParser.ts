import { PropertyAndValueParser, PropertyAndValueResult } from "../../propertyAndValueParser";
import { StackManager, Parser, ProcessResult } from "../../stringToObjectParser";
import { processError } from "./common";
import { IValueOnlyParser, ValueOnlyResult } from "./IValueOnlyParser";

export class ObjectLiteralParser implements IValueOnlyParser {
  type: "ValueOnly" = 'ValueOnly'
  private properties: Array<{
    name: string;
    value: any;
  }> = [];
  
  stackParser!:Parser;
  constructor(private readonly stackManager: StackManager) {
    this.stackParser = new PropertyAndValueParser(this.stackManager)
  }
  
  process(_: string): ProcessResult {
    throw processError;
  }
  getCompleted():ValueOnlyResult {
    const obj = {} as any;
    this.properties.forEach(p => obj[p.name] = p.value);
    return {
      value:obj,
      delimitingChar:undefined
    }
  }
  stackCompleted(parser: PropertyAndValueParser): ProcessResult {
    const completed = parser.getCompleted();
    this.addPossiblePropertyValue(completed);
    return completed.closingCurly||completed.finalChar==='ClosingCurly'?
      ProcessResult.Completed:
      this.lookForMoreProperties();
  }
  private addPossiblePropertyValue(result:PropertyAndValueResult){
    if(!result.closingCurly){
      this.properties.push({ name: result.name, value: result.value });
    }
  }
  private lookForMoreProperties(){
    this.stackManager.setCurrent(new PropertyAndValueParser(this.stackManager));
    return ProcessResult.Continue;
  }
}
