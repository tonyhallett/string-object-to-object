import { WordParser } from "./WordParser";
export class UndefinedParser extends WordParser {
  constructor() {
    super('undefined', undefined);
  }
}
