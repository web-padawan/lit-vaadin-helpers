import { noChange, PropertyPart, render, TemplateResult } from 'lit-html';
import { directive, PartInfo, PartType } from 'lit-html/directive.js';
import type { ContextMenuElement, ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { RendererBase } from './renderer-base';

export type ContextMenuRenderer<T> = (target: HTMLElement, detail: T) => TemplateResult;

class ContextMenuRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.PROPERTY || part.name !== 'renderer') {
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
    const host = part.options?.host;
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return noChange;
    }

    this.saveValue(value);

    if (firstRender) {
      return (
        root: HTMLElement,
        _menu?: ContextMenuElement,
        context?: ContextMenuRendererContext
      ) => {
        const { detail, target } = context as ContextMenuRendererContext;
        render(renderer(target, detail as T), root, { host });
      };
    } else {
      const element = part.element as ContextMenuElement;
      element.render();
      return noChange;
    }
  }
}

const rendererDirective = directive(ContextMenuRendererDirective);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const contextMenuRenderer = <T>(renderer: ContextMenuRenderer<T>, value?: unknown) =>
  rendererDirective(renderer as ContextMenuRenderer<unknown>, value);
