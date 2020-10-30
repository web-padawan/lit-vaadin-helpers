import {
  directive,
  noChange,
  PartInfo,
  PropertyPart,
  PROPERTY_PART,
  render,
  TemplateResult
} from 'lit-html';
import type { ContextMenuElement, ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { RendererBase } from './renderer-base';

export type ContextMenuRenderer<T> = (target: HTMLElement, detail: T) => TemplateResult;

const noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

class ContextMenuRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T extends unknown>(renderer: ContextMenuRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T extends unknown>(
    part: PropertyPart,
    [renderer, value]: [ContextMenuRenderer<T>, unknown]
  ) {
    if (this._initialize<T>(part, [renderer, value])) {
      const element = part.element as ContextMenuElement;
      const firstRender = this.isFirstRender();

      if (!this.hasChanged(value)) {
        return noChange;
      }

      this.saveValue(value);

      if (firstRender) {
        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        const host = (element.getRootNode() as ShadowRoot).host;

        element.renderer = (
          root: HTMLElement,
          _menu?: ContextMenuElement,
          context?: ContextMenuRendererContext
        ) => {
          const { detail, target } = context as ContextMenuRendererContext;
          render(renderer(target, detail as T), root, {
            eventContext: host
          });
        };
      } else {
        element.render();
        return noChange;
      }
    }

    // TODO: stub renderer to prevent errors on initial render,
    // when we do not yet have a reference to the host element.
    return noop;
  }

  private _initialize<T>(part: PropertyPart, [renderer, value]: [ContextMenuRenderer<T>, unknown]) {
    const element = part.element;
    if (element.isConnected) {
      return true;
    }
    Promise.resolve().then(() => {
      this.update<T>(part, [renderer, value]);
    });
    return false;
  }
}

const rendererDirective = directive(ContextMenuRendererDirective);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const contextMenuRenderer = <T>(renderer: ContextMenuRenderer<T>, value?: unknown) =>
  rendererDirective(renderer as ContextMenuRenderer<unknown>, value);
