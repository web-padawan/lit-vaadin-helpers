import { directive, Part, PropertyPart, TemplateResult, render } from 'lit-html';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import type { GridColumnGroupElement } from '@vaadin/vaadin-grid/vaadin-grid-column-group';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export interface ColumnBaseController {
  header?: string;
  resizable?: boolean;
  frozen?: boolean;
  hidden?: boolean;
  textAlign?: 'start' | 'center' | 'end' | null;
  width?: string;
  flexGrow?: number;
  autoWidth?: boolean;
}

export interface ColumnGroupController<M, H> extends ColumnBaseController {
  columns: Array<ColumnController<M, H>>;
}

// TODO: experiment with template literal types to only allow strings
// that actually correspond to the model item sub properties names (requires TS 4.1)
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types
export interface SimpleColumnController extends ColumnBaseController {
  path: string;
}

export interface CustomColumnController<M, H> extends ColumnBaseController {
  renderer: (model: GridModel<M>, host: H) => TemplateResult;
}

// TODO: warn on using "columns" and "renderer" or "path" at the same time.
// Use `never` or conditional types to only allow one of these.

export type ColumnController<M, H> =
  | SimpleColumnController
  | CustomColumnController<M, H>
  | ColumnGroupController<M, H>;

export interface GridController<M, H> {
  columns: Array<ColumnController<M, H>>;
}

class Controller<T, H> {
  private grid!: GridElement;

  constructor(grid: GridElement, host: HTMLElement & H, config: GridController<T, H>) {
    // save reference
    this.grid = grid;

    const setColumnProps = (
      element: GridColumnGroupElement | GridColumnElement,
      data: ColumnController<T, H>
    ) => {
      // TODO: add support for other properties:
      // - headerRenderer
      // - footerRenderer
      if (data.header) {
        element.setAttribute('header', data.header);
      }

      element.textAlign = data.textAlign;

      // TODO: allow to pass functions for changing properties dynamically
      // based on the host element state, for example `hidden` property.
      // Store these functions to call them later in `update()` method.
      element.resizable = data.resizable;

      if (data.frozen != null) {
        element.frozen = data.frozen;
      }

      if (data.hidden != null) {
        element.hidden = data.hidden;
      }
    };

    const setColumnTree = (
      columns: Array<ColumnController<T, H>>,
      parent: GridElement | GridColumnGroupElement
    ) => {
      columns.forEach((data) => {
        let element;

        if ('columns' in data) {
          element = document.createElement('vaadin-grid-column-group');
          parent.appendChild(element);

          setColumnProps(element, data);
          setColumnTree(data.columns, element);
        } else {
          // TODO: add support for filter, sort and tree columns.
          element = document.createElement('vaadin-grid-column');
          parent.appendChild(element);

          setColumnProps(element, data);

          // Properties marked as `readonly` on the group.
          if (data.width) {
            element.setAttribute('width', `${data.width}`);
          }

          if (data.flexGrow !== undefined) {
            element.setAttribute('flex-grow', `${data.flexGrow}`);
          }

          if (data.autoWidth != null) {
            element.autoWidth = data.autoWidth;
          }

          if ('path' in data) {
            element.setAttribute('path', data.path);
          } else if (data.renderer) {
            element.renderer = (
              root: HTMLElement,
              _column?: GridColumnElement,
              model?: GridItemModel
            ) => {
              render(data.renderer(model as GridModel<T>, host), root, { eventContext: host });
            };
          }
        }
      });
    };

    setColumnTree(config.columns, grid);

    // TODO: add support for row details.
  }

  update(): void {
    this.grid.render();
  }
}

const partToController = new WeakMap();
const previousValues = new WeakMap<Part, unknown>();

export const controller = directive(
  <T, H>(config: GridController<T, H>, value?: unknown) => async (part: Part) => {
    const propertyPart = part as PropertyPart;
    if (!(part instanceof PropertyPart) || propertyPart.committer.name !== '..') {
      throw new Error('Only supports ...="" syntax');
    }

    let controller = partToController.get(part);
    if (!controller) {
      const grid = propertyPart.committer.element as GridElement;

      // TODO: refactor to get host from directive metadata.
      // See https://github.com/Polymer/lit-html/issues/1143
      if (!grid.isConnected) {
        await Promise.resolve();
      }

      const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement & H;

      controller = new Controller<T, H>(grid, host, config);
      partToController.set(part, controller);
    } else {
      // NOTE: code below is copied from the "guard" directive.
      // https://github.com/Polymer/lit-html/blob/master/src/directives/guard.ts
      const previousValue = previousValues.get(part);

      if (Array.isArray(value)) {
        // Dirty-check arrays by item
        if (
          Array.isArray(previousValue) &&
          previousValue.length === value.length &&
          value.every((v, i) => v === previousValue[i])
        ) {
          return;
        }
      } else if (previousValue === value && (value !== undefined || previousValues.has(part))) {
        // Dirty-check non-arrays by identity
        return;
      }

      controller.update();
    }

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    previousValues.set(part, Array.isArray(value) ? Array.from(value) : value);
  }
);
