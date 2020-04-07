import { NumberSystemBase } from "./numberSystemBase";

export class OctalParser extends NumberSystemBase{
  constructor(negative:boolean, legacy = false){
    super(8,['0','1','2','3','4','5','6','7'], negative,!legacy)
  }
  static Legacy(negative:boolean, firstChar:'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'){
    const legacyOctalParser = new OctalParser(negative, true);
    legacyOctalParser.numberChars+=firstChar;
    return legacyOctalParser;
  }
}
