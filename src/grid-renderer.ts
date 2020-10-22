import {
  directive,
  Directive,
  noChange,
  PartInfo,
  PropertyPart,
  PROPERTY_PART,
  render,
  TemplateResult
} from 'lit-html';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export type GridHeaderFooterRenderer = () => TemplateResult;

export type GridRenderer<T> = (model: GridModel<T>) => TemplateResult;

const PROPERTIES = ['renderer', 'headerRenderer', 'footerRenderer', 'rowDetailsRenderer'];

// A sentinel that indicates renderer() hasn't been initialized
const initialValue = {};

class GridRendererDirective extends Directive {
  partToGrid = new WeakMap<PropertyPart, GridElement>();

  previousValue: unknown = initialValue;

  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || PROPERTIES.indexOf(part.name) === -1) {
      throw new Error(`Only supports binding to ${PROPERTIES.join(', ')} properties`);
    }
  }

  // Not used but has to be defined to prevent TypeScript compilation errors.
  render<T, R extends GridRenderer<T>>(renderer: R, _value?: unknown) {
    return renderer;
  }

  update<T, R extends GridRenderer<T>>(
    part: PropertyPart,
    [renderer, value]: [R | GridHeaderFooterRenderer, unknown]
  ) {
    const element = part.element as GridElement | GridColumnElement;

    if (Array.isArray(value)) {
      // Dirty-check arrays by item
      if (
        Array.isArray(this.previousValue) &&
        this.previousValue.length === value.length &&
        value.every((v, i) => v === (this.previousValue as Array<unknown>)[i])
      ) {
        return noChange;
      }
    } else if (this.previousValue === value) {
      // Dirty-check non-arrays by identity
      return noChange;
    }

    const firstRender = this.previousValue === initialValue;

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    this.previousValue = Array.isArray(value) ? Array.from(value) : value;

    let grid: GridElement;

    if (firstRender) {
      let result;
      const prop = part.name;

      if (prop === 'rowDetailsRenderer') {
        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        grid = element as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement;

        // row details renderer
        result = (root: HTMLElement, _grid?: GridElement, model?: GridItemModel) => {
          render(this.render<T, R>(renderer as R)(model as GridModel<T>), root, {
            eventContext: host
          });
        };
      } else {
        grid = (element as GridColumnElement)._grid as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement & H;

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
            render((renderer as GridHeaderFooterRenderer)(), root, {
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
