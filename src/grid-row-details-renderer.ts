import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import { AbstractRendererDirective } from './abstract-renderer.js';
import { debounce } from './utils.js';

export type GridRowDetailsLitRenderer<T> = (
  item: T,
  model: GridItemModel<T>,
  grid: GridElement
) => TemplateResult;

class GridRowDetailsRendererDirective extends AbstractRendererDirective<
  GridElement,
  GridRowDetailsLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: GridElement,
    renderer: GridRowDetailsLitRenderer<T>,
    options: RenderOptions
  ) {
    element.rowDetailsRenderer = (
      root: HTMLElement,
      grid?: GridElement,
      model?: GridItemModel<T>
    ) => {
      if (model) {
        const item = model.item;
        render(renderer.call(options.host, item, model, grid as GridElement), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: GridElement) {
    // Only call grid.render() once when if the property is changed,
    // in case if that property is used by several column renderers.
    debounce(element, () => {
      element.render();
    });
  }
}

const rendererDirective = directive(GridRowDetailsRendererDirective);

export const gridRowDetailsRenderer = <T>(
  renderer: GridRowDetailsLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridRowDetailsRendererDirective> =>
  rendererDirective(renderer as GridRowDetailsLitRenderer<unknown>, value);
