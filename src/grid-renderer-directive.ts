import { DirectiveFn, directive, Part, PropertyPart, TemplateResult, render } from 'lit-html';
import type { GridBodyRenderer, GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export type GridRenderer<M, H> = (model: GridModel<M>, host: H) => TemplateResult;

const partToRenderer = new WeakMap();
const previousValues = new WeakMap<Part, unknown>();

// TODO: add directives to support header and footer renderers, and row details renderer.

export const bodyRenderer = directive(
  <T, H>(renderer: GridRenderer<T, H>, value?: unknown): DirectiveFn => async (part: Part) => {
    const propertyPart = part as PropertyPart;
    if (!(part instanceof PropertyPart) || propertyPart.committer.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }

    const cached = partToRenderer.get(part);
    if (!cached) {
      const column = propertyPart.committer.element as GridColumnElement;

      // TODO: refactor to get host from directive metadata.
      // See https://github.com/Polymer/lit-html/issues/1143
      if (!column.isConnected) {
        await Promise.resolve();
      }

      const grid = column._grid as GridElement;
      const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement & H;

      const rendererFn: GridBodyRenderer = (
        root: HTMLElement,
        _column?: GridColumnElement,
        model?: GridItemModel
      ) => {
        render(renderer(model as GridModel<T>, host), root, { eventContext: host });
      };

      part.setValue(rendererFn);
      part.commit();

      partToRenderer.set(part, { grid });
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

      cached.grid.render();
    }

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    previousValues.set(part, Array.isArray(value) ? Array.from(value) : value);
  }
);
