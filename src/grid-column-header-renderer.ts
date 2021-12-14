import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumn } from '@vaadin/grid';
import { AbstractGridColumnRenderer } from './abstract-grid-column-renderer.js';

export type GridColumnHeaderLitRenderer = (column: GridColumn) => TemplateResult;

class GridColumnHeaderRendererDirective extends AbstractGridColumnRenderer<
  GridColumn,
  GridColumnHeaderLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: GridColumn, renderer: GridColumnHeaderLitRenderer, options: RenderOptions) {
    element.headerRenderer = (root: HTMLElement, column?: GridColumn) => {
      render(renderer.call(options.host, column as GridColumn), root, options);
    };
  }
}

const rendererDirective = directive(GridColumnHeaderRendererDirective);

export const columnHeaderRenderer = (
  renderer: GridColumnHeaderLitRenderer,
  value?: unknown
): DirectiveResult<typeof GridColumnHeaderRendererDirective> => rendererDirective(renderer, value);
