import { nothing, RenderOptions, TemplateResult } from 'lit';
import { Directive, ElementPart } from 'lit/directive.js';

export type Renderer = (...args: any[]) => TemplateResult;

export type ElementWithRenderer = Element & {
  renderer: (root: HTMLElement, ...args: any[]) => void;
  render(): void;
};

// A sentinel that indicates renderer hasn't been initialized
const initialValue = {};

export abstract class RendererBase extends Directive {
  previousValue: unknown = initialValue;

  update(part: ElementPart, [renderer, value]: [Renderer, unknown]) {
    const firstRender = this.previousValue === initialValue;

    if (!this.hasChanged(value)) {
      return nothing;
    }

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    this.previousValue = Array.isArray(value) ? Array.from(value) : value;

    const element = part.element as ElementWithRenderer;

    // TODO: support re-assigning renderer function.
    if (firstRender) {
      const host = part.options?.host;
      this.addRenderer(element, renderer, value, { host });
    } else {
      this.runRenderer(element);
    }

    return nothing;
  }

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

  /**
   * Set renderer callback to the element.
   */
  abstract addRenderer(
    element: ElementWithRenderer,
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ): void;

  /**
   * Run renderer callback on the element.
   */
  abstract runRenderer(element: ElementWithRenderer): void;
}
