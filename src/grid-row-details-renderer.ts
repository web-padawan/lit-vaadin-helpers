import { nothing, ElementPart, render, TemplateResult } from 'lit-html';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit-html/directive.js';
import type { GridItemModel } from '@vaadin/vaadin-grid';
import { GridElement } from '@vaadin/vaadin-grid';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { RendererBase } from './renderer-base';
import type { GridModel } from './types';

export type GridRowDetailsRenderer<T> = (item: T, model: GridModel<T>) => TemplateResult;

class GridRowDetailsRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: GridRowDetailsRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [GridRowDetailsRenderer<T>, unknown]) {
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;
    if (element instanceof GridElement) {
      // TODO: support re-assigning renderer function.
      if (firstRender) {
        const host = part.options?.host;
        element.rowDetailsRenderer = (
          root: HTMLElement,
          _grid?: GridElement,
          model?: GridItemModel
        ) => {
          const item = (model as GridItemModel).item;
          render(renderer(item as T, model as GridModel<T>), root, { host });
        };
      } else {
        // Only call grid.render() once when if the property is changed,
        // in case if that property is used by several column renderers.
        this.debounce(
          element,
          () => {
            element.render();
          },
          microTask
        );
      }
    }

    return nothing;
  }
}

const rendererDirective = directive(GridRowDetailsRendererDirective);

export const rowDetailsRenderer = <T>(
  renderer: GridRowDetailsRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridRowDetailsRendererDirective> =>
  rendererDirective(renderer as GridRowDetailsRenderer<unknown>, value);
