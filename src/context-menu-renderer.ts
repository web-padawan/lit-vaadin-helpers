import { nothing, ElementPart, render, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import type { ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { ContextMenuElement } from '@vaadin/vaadin-context-menu';
import { RendererBase } from './renderer-base.js';

export type ContextMenuLitRenderer<T> = (target: HTMLElement, detail: T) => TemplateResult;

class ContextMenuRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T extends unknown>(renderer: ContextMenuLitRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T extends unknown>(
    part: ElementPart,
    [renderer, value]: [ContextMenuLitRenderer<T>, unknown]
  ) {
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;

    if (element instanceof ContextMenuElement) {
      // TODO: support re-assigning renderer function.
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
  renderer: ContextMenuLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof ContextMenuRendererDirective> =>
  rendererDirective(renderer as ContextMenuLitRenderer<unknown>, value);
