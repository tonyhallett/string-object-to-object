import { ProcessorLookup } from "../common";
import { SeparatedNumberParser } from "./separatedNumberParser";
export abstract class SeparatedNumberLookupParser extends SeparatedNumberParser {
  protected processorLookup = new ProcessorLookup();
  constructor() {
    super();
    this.initializeLookup();
  }
  protected abstract initializeLookup(): void;
  processAllowed(char: string) {
    const processor = this.processorLookup.get(char);
    if (processor) {
      return processor.bind(this)(char);
    }
  }
}
