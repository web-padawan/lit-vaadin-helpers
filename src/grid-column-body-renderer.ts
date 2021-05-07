import { nothing, ElementPart, render, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { GridRendererBase } from './grid-renderer-base';
import type { GridModel } from './types';

export type GridColumnBodyLitRenderer<T> = (item: T, model: GridModel<T>) => TemplateResult;

class GridColumnBodyRendererDirective extends GridRendererBase {
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
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;
    if (element instanceof GridColumnElement) {
      // TODO: support re-assigning renderer function.
      if (firstRender) {
        const host = part.options?.host;
        element.renderer = (
          root: HTMLElement,
          _column?: GridColumnElement,
          model?: GridItemModel<T>
        ) => {
          const item = (model as GridItemModel<T>).item;
          render(renderer(item as T, model as GridModel<T>), root, { host });
        };
      } else {
        const grid = (part.element as GridColumnElement)._grid as GridElement;
        if (grid) {
          // Only call grid.render() once when if the property is changed,
          // in case if that property is used by several column renderers.
          this.debounce(grid, () => {
            grid.render();
          });
        }
      }
    }

    return nothing;
  }
}

const rendererDirective = directive(GridColumnBodyRendererDirective);

export const columnBodyRenderer = <T>(
  renderer: GridColumnBodyLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridColumnBodyRendererDirective> =>
  rendererDirective(renderer as GridColumnBodyLitRenderer<unknown>, value);
