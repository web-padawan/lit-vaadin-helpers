import { nothing, ElementPart, render, TemplateResult } from 'lit-html';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit-html/directive.js';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { RendererBase } from './renderer-base';
import type { GridModel } from './types';

export type GridColumnRenderer<T> = (item: T, model: GridModel<T>) => TemplateResult;

class GridColumnBodyRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: GridColumnRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [GridColumnRenderer<T>, unknown]) {
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
          model?: GridItemModel
        ) => {
          const item = (model as GridItemModel).item;
          render(renderer(item as T, model as GridModel<T>), root, { host });
        };
      } else {
        const grid = (part.element as GridColumnElement)._grid as GridElement;
        if (grid) {
          // Only call grid.render() once when if the property is changed,
          // in case if that property is used by several column renderers.
          this.debounce(
            grid,
            () => {
              grid.render();
            },
            microTask
          );
        }
      }
    }

    return nothing;
  }
}

const rendererDirective = directive(GridColumnBodyRendererDirective);

export const bodyRenderer = <T>(
  renderer: GridColumnRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridColumnBodyRendererDirective> =>
  rendererDirective(renderer as GridColumnRenderer<unknown>, value);
