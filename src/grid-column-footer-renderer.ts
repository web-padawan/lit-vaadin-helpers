import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumn } from '@vaadin/grid';
import { AbstractGridColumnRenderer } from './abstract-grid-column-renderer.js';

export type GridColumnFooterLitRenderer = (column: GridColumn) => TemplateResult;

class GridColumnFooterRendererDirective extends AbstractGridColumnRenderer<
  GridColumn,
  GridColumnFooterLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: GridColumn, renderer: GridColumnFooterLitRenderer, options: RenderOptions) {
    element.footerRenderer = (root: HTMLElement, column?: GridColumn) => {
      render(renderer.call(options.host, column as GridColumn), root, options);
    };
  }
}

const rendererDirective = directive(GridColumnFooterRendererDirective);

export const columnFooterRenderer = (
  renderer: GridColumnFooterLitRenderer,
  value?: unknown
): DirectiveResult<typeof GridColumnFooterRendererDirective> => rendererDirective(renderer, value);
