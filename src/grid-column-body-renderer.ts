import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import type { GridItemModel } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { Renderer } from './renderer-base.js';
import { GridRendererBase } from './grid-renderer-base.js';

export type GridColumnBodyLitRenderer<T> = (item: T, model: GridItemModel<T>) => TemplateResult;

class GridColumnBodyRendererDirective extends GridRendererBase<GridColumnElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      _column?: GridColumnElement,
      model?: GridItemModel<T>
    ) => {
      if (model) {
        const item = model.item;
        render(this.render(renderer, value)(item, model), root, options);
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
