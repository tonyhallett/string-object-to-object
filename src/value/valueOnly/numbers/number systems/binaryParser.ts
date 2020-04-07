import { NumberSystemBase } from "./numberSystemBase";

export class BinaryParser extends  NumberSystemBase{
  constructor(negative:boolean){
    super(2,['0','1'],negative);
  }
}
