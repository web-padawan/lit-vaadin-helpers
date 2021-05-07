import { nothing, ElementPart, render, TemplateResult } from 'lit';
import { directive, PartInfo, PartType } from 'lit/directive.js';
import type { GridElement } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { GridRendererBase } from './grid-renderer-base';

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
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;
    if (element instanceof GridColumnElement) {
      // TODO: support re-assigning renderer function.
      if (firstRender) {
        const host = part.options?.host;
        element.footerRenderer = (root: HTMLElement, column?: GridColumnElement) => {
          render(renderer(column as GridColumnElement), root, { host });
        };
      } else {
        const grid = (part.element as GridColumnElement)._grid as GridElement;
        if (grid) {
          // Only call grid.render() once when if the property is changed,
          // in case if that property is used by several column renderers.
          this.debounce(grid, () => {
            grid.render();
          });
        }
      }
    }

    return nothing;
  }
}

export const columnFooterRenderer = directive(GridColumnFooterRendererDirective);
