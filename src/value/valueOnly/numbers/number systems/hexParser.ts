import { NumberSystemBase } from "./numberSystemBase";

export class HexParser extends NumberSystemBase{
  constructor(negative:boolean){
    super(16,['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'],negative);
  }
}