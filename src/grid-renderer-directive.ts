import { DirectiveFn, directive, Part, PropertyPart, TemplateResult, render } from 'lit-html';
import type {
  GridBodyRenderer,
  GridElement,
  GridHeaderFooterRenderer,
  GridItemModel,
  GridRowDetailsRenderer
} from '@vaadin/vaadin-grid';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export type GridLitHeaderFooterRenderer<H> = (host: H) => TemplateResult;

export type GridLitRenderer<T, H> = (model: GridModel<T>, host: H) => TemplateResult;

const partToRenderer = new WeakMap();
const previousValues = new WeakMap<Part, unknown>();

const PROPERTIES = ['renderer', 'headerRenderer', 'footerRenderer', 'rowDetailsRenderer'];

export const gridRenderer = directive(
  <T, H>(
    renderer: GridLitRenderer<T, H> | GridLitHeaderFooterRenderer<H>,
    value?: unknown
  ): DirectiveFn => async (part: Part) => {
    const propertyPart = part as PropertyPart;
    if (!(part instanceof PropertyPart) || PROPERTIES.indexOf(propertyPart.committer.name) === -1) {
      throw new Error(`Only supports binding to ${PROPERTIES.join(', ')} properties`);
    }

    const cached = partToRenderer.get(part);
    const element = propertyPart.committer.element as GridElement | GridColumnElement;
    if (!cached) {
      if (!element.isConnected) {
        await Promise.resolve();
      }

      let grid: GridElement;
      let rendererFn: GridBodyRenderer | GridHeaderFooterRenderer | GridRowDetailsRenderer;

      const prop = propertyPart.committer.name;

      if (prop === 'rowDetailsRenderer') {
        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        grid = element as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement & H;

        // row details renderer
        rendererFn = (root: HTMLElement, _grid?: GridElement, model?: GridItemModel) => {
          render((renderer as GridLitRenderer<T, H>)(model as GridModel<T>, host), root, {
            eventContext: host
          });
        };
      } else {
        grid = (element as GridColumnElement)._grid as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement & H;

        if (prop === 'renderer') {
          // body renderer
          rendererFn = (root: HTMLElement, _column?: GridColumnElement, model?: GridItemModel) => {
            render((renderer as GridLitRenderer<T, H>)(model as GridModel<T>, host), root, {
              eventContext: host
            });
          };
        } else {
          // header / footer renderer
          rendererFn = (root: HTMLElement) => {
            render((renderer as GridLitHeaderFooterRenderer<H>)(host), root, {
              eventContext: host
            });
          };
        }
      }

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
