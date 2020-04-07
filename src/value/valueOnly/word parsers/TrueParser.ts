import { WordParser } from "./WordParser";
export class TrueParser extends WordParser {
  constructor() {
    super('true', true);
  }
}
