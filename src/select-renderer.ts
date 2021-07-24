import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { SelectElement } from '@vaadin/vaadin-select';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type SelectLitRenderer = (select: SelectElement) => TemplateResult;

class SelectRendererDirective extends AbstractRendererDirective<SelectElement, SelectLitRenderer> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: SelectElement, renderer: SelectLitRenderer, options: RenderOptions) {
    element.renderer = (root: HTMLElement, select?: SelectElement) => {
      render(renderer.call(options.host, select as SelectElement), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: SelectElement) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(SelectRendererDirective);

export const selectRenderer = (
  renderer: SelectLitRenderer,
  value?: unknown
): DirectiveResult<typeof SelectRendererDirective> => rendererDirective(renderer, value);
