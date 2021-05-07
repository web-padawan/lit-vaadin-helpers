import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, PartInfo, PartType } from 'lit/directive.js';
import { ContextMenuElement, ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { ElementWithRenderer, Renderer, RendererBase } from './renderer-base.js';

export type ContextMenuLitRenderer = (context: ContextMenuRendererContext) => TemplateResult;

class ContextMenuRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: ContextMenuLitRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [ContextMenuLitRenderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: ElementWithRenderer,
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      _menu?: ContextMenuElement,
      context?: ContextMenuRendererContext
    ) => {
      if (context) {
        render(this.render(renderer, value)(context), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: ElementWithRenderer) {
    element.render();
  }
}

export const contextMenuRenderer = directive(ContextMenuRendererDirective);
