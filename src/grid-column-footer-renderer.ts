import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { GridRendererDirective } from './grid-renderer-base.js';

export type GridColumnFooterLitRenderer = (column: GridColumnElement) => TemplateResult;

class GridColumnFooterRendererDirective extends GridRendererDirective<
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

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: GridColumnElement) {
    const grid = element._grid;
    if (grid) {
      // Only call grid.render() once when if the property is changed,
      // in case if that property is used by several column renderers.
      this.debounce(grid, () => {
        grid.render();
      });
    }
  }
}

const rendererDirective = directive(GridColumnFooterRendererDirective);

export const columnFooterRenderer = (
  renderer: GridColumnFooterLitRenderer,
  value?: unknown
): DirectiveResult<typeof GridColumnFooterRendererDirective> => rendererDirective(renderer, value);
