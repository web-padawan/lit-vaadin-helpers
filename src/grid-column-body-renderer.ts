import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import type { GridItemModel } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { GridRendererDirective } from './grid-renderer-base.js';

export type GridColumnBodyLitRenderer<T> = (
  item: T,
  model: GridItemModel<T>,
  column: GridColumnElement<T>
) => TemplateResult;

class GridColumnBodyRendererDirective extends GridRendererDirective<GridColumnElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  render<T>(renderer: GridColumnBodyLitRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [GridColumnBodyLitRenderer<T>, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: GridColumnElement,
    renderer: GridColumnBodyLitRenderer<T>,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      column?: GridColumnElement,
      model?: GridItemModel<T>
    ) => {
      if (model && column) {
        const item = model.item;
        render(this.render(renderer, value).call(options.host, item, model, column), root, options);
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
