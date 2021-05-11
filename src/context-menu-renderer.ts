import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { ContextMenuElement, ContextMenuRendererContext } from '@vaadin/vaadin-context-menu';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type ContextMenuLitRenderer = (
  context: ContextMenuRendererContext,
  menu: ContextMenuElement
) => TemplateResult;

class ContextMenuRendererDirective extends AbstractRendererDirective<
  ContextMenuElement,
  ContextMenuLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: ContextMenuElement,
    renderer: ContextMenuLitRenderer,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      menu?: ContextMenuElement,
      context?: ContextMenuRendererContext
    ) => {
      render(
        renderer.call(
          options.host,
          context as ContextMenuRendererContext,
          menu as ContextMenuElement
        ),
        root,
        options
      );
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
