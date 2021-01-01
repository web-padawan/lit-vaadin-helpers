import { nothing, ElementPart, render } from 'lit-html';
import { directive, PartInfo, PartType } from 'lit-html/directive.js';
import { RendererBase } from './renderer-base';
import type { Renderer } from './types';

interface HasRenderer {
  renderer: (root: HTMLElement) => void;
  render(): void;
}

class RendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: Renderer, _value?: unknown) {
    return renderer();
  }

  update(part: ElementPart, [renderer, value]: [Renderer, unknown]) {
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element as HTMLElement & HasRenderer;

    // TODO: support re-assigning renderer function.
    if (firstRender) {
      const host = part.options?.host;
      element.renderer = (root: HTMLElement) => {
        render(this.render(renderer, value), root, { host });
      };
    } else {
      element.render();
    }

    return nothing;
  }
}

export const renderer = directive(RendererDirective);
