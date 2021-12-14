import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridColumn, GridItemModel } from '@vaadin/grid';
import { AbstractGridColumnRenderer } from './abstract-grid-column-renderer.js';

export type GridColumnBodyLitRenderer<T> = (
  item: T,
  model: GridItemModel<T>,
  column: GridColumn<T>
) => TemplateResult;

class GridColumnBodyRendererDirective extends AbstractGridColumnRenderer<
  GridColumn,
  GridColumnBodyLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: GridColumn,
    renderer: GridColumnBodyLitRenderer<T>,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement, column?: GridColumn, model?: GridItemModel<T>) => {
      if (model) {
        render(renderer.call(options.host, model.item, model, column as GridColumn), root, options);
      }
    };
  }
}

const rendererDirective = directive(GridColumnBodyRendererDirective);

export const columnBodyRenderer = <T>(
  renderer: GridColumnBodyLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridColumnBodyRendererDirective> =>
  rendererDirective(renderer as GridColumnBodyLitRenderer<unknown>, value);
