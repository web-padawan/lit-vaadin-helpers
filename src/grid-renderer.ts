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

const noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

export type GridRenderer<T> = (item: T, model: GridModel<T>) => TemplateResult;

const PROPERTIES = ['renderer', 'headerRenderer', 'footerRenderer', 'rowDetailsRenderer'];

class GridRendererDirective extends RendererBase {
  partToGrid = new WeakMap<PropertyPart, GridElement>();

  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || PROPERTIES.indexOf(part.name) === -1) {
      throw new Error(`Only supports binding to ${PROPERTIES.join(', ')} properties`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: GridRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: PropertyPart, [renderer, value]: [GridRenderer<T> | Renderer, unknown]) {
    if (this._initialize<T>(part, [renderer, value])) {
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
          result = (root: HTMLElement, _grid: GridElement, model: GridItemModel) => {
            render(renderer(model.item as T, model as GridModel<T>), root, {
              eventContext: host
            });
          };
        } else {
          grid = (element as GridColumnElement)._grid as GridElement;
          const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement;

          if (prop === 'renderer') {
            // body renderer
            result = (root: HTMLElement, _column: GridColumnElement, model: GridItemModel) => {
              render(renderer(model.item as T, model as GridModel<T>), root, {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element as any)[prop] = result;
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

    // TODO: stub renderer to prevent errors on initial render,
    // when we do not yet have a reference to the host element.
    return noop;
  }

  private _initialize<T>(
    part: PropertyPart,
    [renderer, value]: [GridRenderer<T> | Renderer, unknown]
  ) {
    const element = part.element as GridElement | GridColumnElement;
    if (element.isConnected) {
      return true;
    }
    Promise.resolve().then(() => {
      this.update<T>(part, [renderer, value]);
    });
    return false;
  }
}

const rendererDirective = directive(GridRendererDirective);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const gridRenderer = <T>(renderer: GridRenderer<T>, value?: unknown) =>
  rendererDirective(renderer as GridRenderer<unknown>, value);
