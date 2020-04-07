import {StringToObjectParser, ProcessResult} from './stringToObjectParser'
export function stringToObject(stringObject:string){
  const parser = new StringToObjectParser();
  let processResult = ProcessResult.Continue;
  const str = stringObject.trim();
  if(str[0]==='{'){
    for (var x = 1, c=''; c = str.charAt(x); x++) { 
      processResult = parser.process(c);
      if(processResult === ProcessResult.Break){
        console.log('break in loop');
        throw new Error('String is not an object');
      }
    }
    if(processResult!==ProcessResult.Completed){
      throw new Error('String is not an object');
    }
    return parser.getCompleted();
  }else{
    throw new Error('String is not an object');
  }
  
}