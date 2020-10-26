import { directive, noChange, PartInfo, PropertyPart, PROPERTY_PART, render } from 'lit-html';
import { RendererBase } from './renderer-base';
import type { Renderer } from './types';

interface HasRenderer {
  renderer: (root: HTMLElement) => void;
  render(): void;
}

const noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

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

  update(part: PropertyPart, [value, renderer]: [unknown, Renderer]) {
    if (this._initialize(part, [value, renderer])) {
      const element = part.element as HTMLElement & HasRenderer;
      const firstRender = this.isFirstRender();

      if (!this.hasChanged(value)) {
        return noChange;
      }

      this.saveValue(value);

      if (firstRender) {
        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        const host = (element.getRootNode() as ShadowRoot).host;

        element.renderer = (root: HTMLElement) => {
          render(this.render(value, renderer), root, { eventContext: host });
        };
      } else {
        (element as HTMLElement & HasRenderer).render();
        return noChange;
      }
    }

    // TODO: stub renderer to prevent errors on initial render,
    // when we do not yet have a reference to the host element.
    return noop;
  }

  private _initialize(part: PropertyPart, [value, renderer]: [unknown, Renderer]) {
    const element = part.element;
    if (element.isConnected) {
      return true;
    }
    Promise.resolve().then(() => {
      this.update(part, [value, renderer]);
    });
    return false;
  }
}

export const renderer = directive(RendererDirective);
