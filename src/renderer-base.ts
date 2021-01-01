import { Directive } from 'lit-html/directive.js';

// A sentinel that indicates renderer hasn't been initialized
const initialValue = {};

export abstract class RendererBase extends Directive {
  previousValue: unknown = initialValue;

  hasChanged(value: unknown): boolean {
    let result = true;

    if (Array.isArray(value)) {
      // Dirty-check arrays by item
      if (
        Array.isArray(this.previousValue) &&
        this.previousValue.length === value.length &&
        value.every((v, i) => v === (this.previousValue as Array<unknown>)[i])
      ) {
        result = false;
      }
    } else if (this.previousValue === value) {
      // Dirty-check non-arrays by identity
      result = false;
    }
    return result;
  }

  isFirstRender(): boolean {
    return this.previousValue === initialValue;
  }

  saveValue(value: unknown): void {
    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    this.previousValue = Array.isArray(value) ? Array.from(value) : value;
  }
}
