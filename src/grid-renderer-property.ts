import { TemplateResult, render } from 'lit-html';
import type { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import type { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import type { PolymerElementConstructor } from '@polymer/polymer/interfaces';

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}

export type GridRenderer<M, H> = (model: GridModel<M>, host: H) => TemplateResult;

const columnToRenderer = new WeakMap();

customElements.whenDefined('vaadin-grid-column').then(() => {
  const Column = customElements.get('vaadin-grid-column') as PolymerElementConstructor;

  Object.defineProperty(Column.prototype, 'litRenderer', {
    async set(renderer) {
      const column = this as GridColumnElement;
      const cached = columnToRenderer.get(column);

      if (!column.isConnected) {
        await Promise.resolve();
      }

      if (!cached) {
        const grid = column._grid as GridElement;
        const host = (grid.getRootNode() as ShadowRoot).host as HTMLElement;

        column.renderer = (
          root: HTMLElement,
          _column?: GridColumnElement,
          model?: GridItemModel
        ) => {
          render(renderer(model as GridModel<T>, host), root, { eventContext: host });
        };
        columnToRenderer.set(column, { grid });
      } else {
        cached.grid.render();
      }
    }
  });
});
