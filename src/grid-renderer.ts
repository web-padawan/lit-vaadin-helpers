import {
  directive,
  noChange,
  PartInfo,
  PropertyPart,
  PROPERTY_PART,
  render,
  TemplateResult
} from 'lit-html';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
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

export type GridRenderer<T> = (model: GridModel<T>) => TemplateResult;

const PROPERTIES = ['renderer', 'headerRenderer', 'footerRenderer', 'rowDetailsRenderer'];

class GridRendererDirective extends RendererBase {
  partToGrid = new WeakMap<PropertyPart, GridElement>();

  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || PROPERTIES.indexOf(part.name) === -1) {
      throw new Error(`Only supports binding to ${PROPERTIES.join(', ')} properties`);
    }
  }

  render<T, R extends GridRenderer<T>>(renderer: R, _value?: unknown) {
    return renderer;
  }

  update<T, R extends GridRenderer<T>>(
    part: PropertyPart,
    [renderer, value]: [R | Renderer, unknown]
  ) {
    const element = part.element as GridElement | GridColumnElement;
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
        grid = element as GridElement;

        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement;

        // row details renderer
        result = (root: HTMLElement, _grid?: GridElement, model?: GridItemModel) => {
          render(this.render<T, R>(renderer as R)(model as GridModel<T>), root, {
            eventContext: host
          });
        };
      } else {
        grid = (element as GridColumnElement)._grid as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement;

        if (prop === 'renderer') {
          // body renderer
          result = (root: HTMLElement, _column?: GridColumnElement, model?: GridItemModel) => {
            render(this.render<T, R>(renderer as R)(model as GridModel<T>), root, {
              eventContext: host
            });
          };
        } else {
          // header / footer renderer
          result = (root: HTMLElement) => {
            render((renderer as Renderer)(), root, {
              eventContext: host
            });
          };
        }
      }
      this.partToGrid.set(part, grid);
      return result;
    } else {
      grid = this.partToGrid.get(part) as GridElement;
      grid.render();
      return noChange;
    }
  }
}

export const gridRenderer = directive(GridRendererDirective);
