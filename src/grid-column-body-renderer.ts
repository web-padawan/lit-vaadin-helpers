import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import type { GridItemModel } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { GridRendererDirective } from './grid-renderer-base.js';

export type GridColumnBodyLitRenderer<T> = (
  item: T,
  model: GridItemModel<T>,
  column: GridColumnElement<T>
) => TemplateResult;

class GridColumnBodyRendererDirective extends GridRendererDirective<
  GridColumnElement,
  GridColumnBodyLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: GridColumnElement,
    renderer: GridColumnBodyLitRenderer<T>,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      column?: GridColumnElement,
      model?: GridItemModel<T>
    ) => {
      if (model) {
        const item = model.item;
        render(
          renderer.call(options.host, item, model, column as GridColumnElement),
          root,
          options
        );
      }
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

const rendererDirective = directive(GridColumnBodyRendererDirective);

export const columnBodyRenderer = <T>(
  renderer: GridColumnBodyLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridColumnBodyRendererDirective> =>
  rendererDirective(renderer as GridColumnBodyLitRenderer<unknown>, value);
