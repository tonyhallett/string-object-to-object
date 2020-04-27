import {stringToObject} from './stringToObject'
export function stringToAny(any:string){
  const toParse = any.trim();
  try{
    if(toParse[0]==='{'){
      return stringToObject(toParse);
    }
    
    return stringToObject(`{ f:${toParse} }`).f;
  }catch(e){
    throw new Error('Malformed');
  }
}