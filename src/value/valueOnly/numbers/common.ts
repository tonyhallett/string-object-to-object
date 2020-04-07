import { ProcessResult } from "../../../stringToObjectParser"

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
export type CharProcessor<T extends string|string[],U> = T extends string ?
  [ T,(char:T)=>U]:
  [ T,(char:ArrayElement<T>)=>U]

export type Processor<T extends string|string[]> = CharProcessor<T, ProcessResult>

export class CharProcessorLookup<U>{
  private lookup:Record<string, CharProcessor<any,U>[1]> = {}
  add(...processors:CharProcessor<any,U>[]){
    processors.forEach(processor => {
      const key = processor[0];
      //if(Array.isArray(key)){
      if(key instanceof Array){
        key.forEach(k => this.lookup[k] = processor[1])
      }else{
        this.lookup[key] = processor[1];
      }
    })
  }
  get(char:string):CharProcessor<any,U>[1]|undefined{
    return this.lookup[char] as any
  }
}
export class ProcessorLookup extends CharProcessorLookup<ProcessResult>{}