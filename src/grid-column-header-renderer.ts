import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumnElement } from '@vaadin/vaadin-grid';
import { AbstractGridColumnRenderer } from './abstract-grid-column-renderer.js';

export type GridColumnHeaderLitRenderer = (column: GridColumnElement) => TemplateResult;

class GridColumnHeaderRendererDirective extends AbstractGridColumnRenderer<
  GridColumnElement,
  GridColumnHeaderLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: GridColumnElement,
    renderer: GridColumnHeaderLitRenderer,
    options: RenderOptions
  ) {
    element.headerRenderer = (root: HTMLElement, column?: GridColumnElement) => {
      render(renderer.call(options.host, column as GridColumnElement), root, options);
    };
  }
}

const rendererDirective = directive(GridColumnHeaderRendererDirective);

export const columnHeaderRenderer = (
  renderer: GridColumnHeaderLitRenderer,
  value?: unknown
): DirectiveResult<typeof GridColumnHeaderRendererDirective> => rendererDirective(renderer, value);
