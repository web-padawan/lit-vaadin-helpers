import { nothing, ElementPart, render, TemplateResult } from 'lit-html';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit-html/directive.js';
import type { ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { ContextMenuElement } from '@vaadin/vaadin-context-menu';
import { RendererBase } from './renderer-base';

export type ContextMenuRenderer<T> = (target: HTMLElement, detail: T) => TemplateResult;

class ContextMenuRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T extends unknown>(renderer: ContextMenuRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T extends unknown>(
    part: ElementPart,
    [renderer, value]: [ContextMenuRenderer<T>, unknown]
  ) {
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;

    // TODO: support re-assigning renderer function.
    if (element instanceof ContextMenuElement) {
      if (firstRender) {
        const host = part.options?.host;
        element.renderer = (
          root: HTMLElement,
          _menu?: ContextMenuElement,
          context?: ContextMenuRendererContext
        ) => {
          const { detail, target } = context as ContextMenuRendererContext;
          render(renderer(target, detail as T), root, { host });
        };
      } else {
        element.render();
      }
    }

    return nothing;
  }
}

const rendererDirective = directive(ContextMenuRendererDirective);

export const contextMenuRenderer = <T>(
  renderer: ContextMenuRenderer<T>,
  value?: unknown
): DirectiveResult<typeof ContextMenuRendererDirective> =>
  rendererDirective(renderer as ContextMenuRenderer<unknown>, value);
