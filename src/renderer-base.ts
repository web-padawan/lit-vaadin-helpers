import { Directive } from 'lit-html';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import type { AsyncInterface } from '@polymer/polymer/interfaces';

// A sentinel that indicates renderer hasn't been initialized
const initialValue = {};

interface HasLitDebouncer {
  _debounceLitRender: Debouncer;
}

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

  debounce(element: HTMLElement, cb: () => unknown, asyncModule: AsyncInterface): void {
    const el = element as HTMLElement & HasLitDebouncer;
    el._debounceLitRender = Debouncer.debounce(el._debounceLitRender, asyncModule, cb);
  }
}
