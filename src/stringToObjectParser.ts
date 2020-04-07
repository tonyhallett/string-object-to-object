export enum ProcessResult{Continue,Completed,Break} 
import { ObjectLiteralParser } from "./value/valueOnly/objectLiteralParser";

export interface StackManager{
  setCurrent(parser:Parser):void
}

export interface Parser {
  process(char: string): ProcessResult;
  getCompleted(): any;
  stackCompleted(parser: Parser): ProcessResult;
  type: string;
  stackParser?:Parser
}

export class StringToObjectParser implements StackManager{
  setCurrentActual(parser: Parser): void {
    if(this.currentParser!==undefined){
      this.stack.push(this.currentParser);
    }
    this.currentParser = parser;
  }
  setCurrent(parser:Parser){
    let currentParser:Parser|undefined = parser;
    while(currentParser){
      this.setCurrentActual(currentParser);
      currentParser = currentParser.stackParser;
    }
  }
  stack:Array<Parser> = [];
  constructor(){
    this.setCurrent(new ObjectLiteralParser(this));
  }
  completed:any
  currentParser!:Parser;
  process(char:string):ProcessResult{
    let result = this.currentParser.process(char);
    if(result === ProcessResult.Completed){
      while(this.stack.length>0&&result === ProcessResult.Completed){
        const completedParser = this.currentParser;
        this.currentParser = this.stack.pop()!;
        result = this.currentParser.stackCompleted(completedParser);
      }
    }
    return result;
  }
  getCompleted():any{
    return this.currentParser.getCompleted().value;
  }
}