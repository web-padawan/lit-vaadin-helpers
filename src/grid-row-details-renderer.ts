import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { Grid, GridItemModel } from '@vaadin/grid';
import { AbstractRendererDirective } from './abstract-renderer.js';
import { debounce } from './utils.js';

export type GridRowDetailsLitRenderer<T> = (
  item: T,
  model: GridItemModel<T>,
  grid: Grid
) => TemplateResult;

class GridRowDetailsRendererDirective extends AbstractRendererDirective<
  Grid,
  GridRowDetailsLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(element: Grid, renderer: GridRowDetailsLitRenderer<T>, options: RenderOptions) {
    element.rowDetailsRenderer = (root: HTMLElement, grid?: Grid, model?: GridItemModel<T>) => {
      if (model) {
        const item = model.item;
        render(renderer.call(options.host, item, model, grid as Grid), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: Grid) {
    // Only call grid.requestContentUpdate() once per property change
    // in case if that property is used by several column renderers.
    debounce(element, () => {
      element.requestContentUpdate();
    });
  }
}

const rendererDirective = directive(GridRowDetailsRendererDirective);

export const gridRowDetailsRenderer = <T>(
  renderer: GridRowDetailsLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridRowDetailsRendererDirective> =>
  rendererDirective(renderer as GridRowDetailsLitRenderer<unknown>, value);
