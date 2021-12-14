import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { Select } from '@vaadin/select';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type SelectLitRenderer = (select: Select) => TemplateResult;

class SelectRendererDirective extends AbstractRendererDirective<Select, SelectLitRenderer> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: Select, renderer: SelectLitRenderer, options: RenderOptions) {
    element.renderer = (root: HTMLElement, select?: Select) => {
      render(renderer.call(options.host, select as Select), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: Select) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(SelectRendererDirective);

export const selectRenderer = (
  renderer: SelectLitRenderer,
  value?: unknown
): DirectiveResult<typeof SelectRendererDirective> => rendererDirective(renderer, value);
