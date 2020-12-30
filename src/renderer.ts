import { noChange, PropertyPart, render } from 'lit-html';
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
    if (part.type !== PartType.PROPERTY || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: Renderer, _value?: unknown) {
    return renderer();
  }

  update(part: PropertyPart, [renderer, value]: [Renderer, unknown]) {
    const host = part.options?.host;

    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return noChange;
    }

    this.saveValue(value);

    if (firstRender) {
      return (root: HTMLElement) => {
        render(this.render(renderer, value), root, { host });
      };
    } else {
      const element = part.element as HTMLElement & HasRenderer;
      element.render();
      return noChange;
    }
  }
}

export const renderer = directive(RendererDirective);
