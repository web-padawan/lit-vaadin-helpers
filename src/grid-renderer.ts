import { noChange, PropertyPart, render, TemplateResult } from 'lit-html';
import { directive, PartInfo, PartType } from 'lit-html/directive.js';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { RendererBase } from './renderer-base';
import type { Renderer } from './types';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export type GridRenderer<T> = (item: T, model: GridModel<T>) => TemplateResult;

const PROPERTIES = ['renderer', 'headerRenderer', 'footerRenderer', 'rowDetailsRenderer'];

class GridRendererDirective extends RendererBase {
  partToGrid = new WeakMap<PropertyPart, GridElement>();

  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.PROPERTY || PROPERTIES.indexOf(part.name) === -1) {
      throw new Error(`Only supports binding to ${PROPERTIES.join(', ')} properties`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: GridRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: PropertyPart, [renderer, value]: [GridRenderer<T> | Renderer, unknown]) {
    const host = part.options?.host;
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return noChange;
    }

    this.saveValue(value);

    let grid: GridElement;

    if (firstRender) {
      let result;
      const prop = part.name;

      if (prop === 'rowDetailsRenderer') {
        grid = part.element as GridElement;

        // row details renderer
        result = (root: HTMLElement, _grid: GridElement, model: GridItemModel) => {
          render(renderer(model.item as T, model as GridModel<T>), root, { host });
        };
      } else {
        grid = (part.element as GridColumnElement)._grid as GridElement;

        if (prop === 'renderer') {
          // body renderer
          result = (root: HTMLElement, _column: GridColumnElement, model: GridItemModel) => {
            render(renderer(model.item as T, model as GridModel<T>), root, { host });
          };
        } else {
          // header / footer renderer
          result = (root: HTMLElement) => {
            render((renderer as Renderer)(), root, { host });
          };
        }
      }
      this.partToGrid.set(part, grid);

      return result;
    } else {
      grid = this.partToGrid.get(part) as GridElement;
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
      return noChange;
    }
  }
}

const rendererDirective = directive(GridRendererDirective);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const gridRenderer = <T>(renderer: GridRenderer<T>, value?: unknown) =>
  rendererDirective(renderer as GridRenderer<unknown>, value);
