import { nothing, ElementPart, render, TemplateResult } from 'lit-html';
import { directive, PartInfo, PartType } from 'lit-html/directive.js';
import type { GridElement } from '@vaadin/vaadin-grid';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { RendererBase } from './renderer-base';

export type GridColumnFooterRenderer = (column: GridColumnElement) => TemplateResult;

class GridColumnFooterRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: GridColumnFooterRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [GridColumnFooterRenderer, unknown]) {
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
          this.debounce(
            grid,
            () => {
              grid.render();
            },
            microTask
          );
        }
      }
    }

    return nothing;
  }
}

export const footerRenderer = directive(GridColumnFooterRendererDirective);
