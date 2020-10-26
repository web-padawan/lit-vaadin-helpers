import { directive, noChange, PartInfo, PropertyPart, PROPERTY_PART, render } from 'lit-html';
import { RendererBase } from './renderer-base';
import type { Renderer } from './types';

interface HasRenderer {
  render(): void;
}

class RendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  render(_value: unknown, renderer: Renderer) {
    return renderer();
  }

  update(part: PropertyPart, [value, renderer]: Parameters<this['render']>) {
    const element = part.element as HTMLElement;
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return noChange;
    }

    this.saveValue(value);

    if (firstRender) {
      // TODO: refactor to get host from directive metadata.
      // See https://github.com/Polymer/lit-html/issues/1143
      const host = (element.getRootNode() as ShadowRoot).host;

      return (root: HTMLElement) => {
        render(this.render(value, renderer), root, { eventContext: host });
      };
    } else {
      (element as HTMLElement & HasRenderer).render();
      return noChange;
    }
  }
}

export const renderer = directive(RendererDirective);
