import { WordParser } from "./WordParser";
export class FalseParser extends WordParser {
  constructor() {
    super('false', false);
  }
}
