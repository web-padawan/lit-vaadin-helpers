import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { ContextMenuElement, ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type ContextMenuLitRenderer = (
  context: ContextMenuRendererContext,
  menu: ContextMenuElement
) => TemplateResult;

class ContextMenuRendererDirective extends AbstractRendererDirective<ContextMenuElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

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
    element: ContextMenuElement,
    renderer: ContextMenuLitRenderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      menu?: ContextMenuElement,
      context?: ContextMenuRendererContext
    ) => {
      if (context && menu) {
        render(this.render(renderer, value).call(options.host, context, menu), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: ContextMenuElement) {
    element.render();
  }
}

const rendererDirective = directive(ContextMenuRendererDirective);

export const contextMenuRenderer = (
  renderer: ContextMenuLitRenderer,
  value?: unknown
): DirectiveResult<typeof ContextMenuRendererDirective> => rendererDirective(renderer, value);
