import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, PartInfo, PartType } from 'lit/directive.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column.js';
import { ElementWithRenderer, Renderer } from './renderer-base.js';
import { GridRendererBase } from './grid-renderer-base.js';

export type GridColumnFooterLitRenderer = (column: GridColumnElement) => TemplateResult;

class GridColumnFooterRendererDirective extends GridRendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: GridColumnFooterLitRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [GridColumnFooterLitRenderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: ElementWithRenderer,
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ) {
    ((element as unknown) as GridColumnElement).footerRenderer = (
      root: HTMLElement,
      column?: GridColumnElement
    ) => {
      render(this.render(renderer, value)(column as GridColumnElement), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: ElementWithRenderer) {
    const grid = ((element as unknown) as GridColumnElement)._grid;
    if (grid) {
      // Only call grid.render() once when if the property is changed,
      // in case if that property is used by several column renderers.
      this.debounce(grid, () => {
        grid.render();
      });
    }
  }
}

export const columnFooterRenderer = directive(GridColumnFooterRendererDirective);
