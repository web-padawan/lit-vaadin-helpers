import { GridColumnElement } from '@vaadin/vaadin-grid';
import { AbstractRendererDirective, AbstractLitRenderer } from './abstract-renderer.js';
import { debounce } from './utils.js';

export abstract class AbstractGridColumnRenderer<
  T extends GridColumnElement,
  R extends AbstractLitRenderer
> extends AbstractRendererDirective<T, R> {
  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: GridColumnElement): void {
    const grid = element._grid;
    if (grid) {
      // Only call grid.requestContentUpdate() once per property change
      // in case if that property is used by several column renderers.
      debounce(grid, () => {
        grid.requestContentUpdate();
      });
    }
  }
}
