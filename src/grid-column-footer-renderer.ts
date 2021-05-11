import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { AbstractGridColumnRenderer } from './abstract-grid-column-renderer.js';

export type GridColumnFooterLitRenderer = (column: GridColumnElement) => TemplateResult;

class GridColumnFooterRendererDirective extends AbstractGridColumnRenderer<
  GridColumnElement,
  GridColumnFooterLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: GridColumnElement,
    renderer: GridColumnFooterLitRenderer,
    options: RenderOptions
  ) {
    element.footerRenderer = (root: HTMLElement, column?: GridColumnElement) => {
      render(renderer.call(options.host, column as GridColumnElement), root, options);
    };
  }
}

const rendererDirective = directive(GridColumnFooterRendererDirective);

export const columnFooterRenderer = (
  renderer: GridColumnFooterLitRenderer,
  value?: unknown
): DirectiveResult<typeof GridColumnFooterRendererDirective> => rendererDirective(renderer, value);
