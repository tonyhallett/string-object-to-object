import { WordParser } from "./WordParser";
export class NullParser extends WordParser {
  constructor() {
    super('null', null);
  }
}
