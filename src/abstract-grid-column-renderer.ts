import { Grid, GridColumn } from '@vaadin/grid';
import { AbstractRendererDirective, AbstractLitRenderer } from './abstract-renderer.js';
import { debounce } from './utils.js';

export abstract class AbstractGridColumnRenderer<
  T extends GridColumn,
  R extends AbstractLitRenderer
> extends AbstractRendererDirective<T, R> {
  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: GridColumn): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grid = (element as any)._grid as Grid;
    if (grid) {
      // Only call grid.requestContentUpdate() once per property change
      // in case if that property is used by several column renderers.
      debounce(grid, () => {
        grid.requestContentUpdate();
      });
    }
  }
}
