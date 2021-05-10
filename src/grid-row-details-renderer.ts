import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { GridElement, GridItemModel } from '@vaadin/vaadin-grid';
import { Renderer } from './abstract-renderer.js';
import { GridRendererDirective } from './grid-renderer-base.js';

export type GridRowDetailsLitRenderer<T> = (item: T, model: GridItemModel<T>) => TemplateResult;

class GridRowDetailsRendererDirective extends GridRendererDirective<GridElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: GridRowDetailsLitRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [GridRowDetailsLitRenderer<T>, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(element: GridElement, renderer: Renderer, value: unknown, options: RenderOptions) {
    element.rowDetailsRenderer = (
      root: HTMLElement,
      _grid?: GridElement,
      model?: GridItemModel<T>
    ) => {
      if (model) {
        const item = model.item;
        render(this.render(renderer, value)(item, model), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: GridElement) {
    // Only call grid.render() once when if the property is changed,
    // in case if that property is used by several column renderers.
    this.debounce(element, () => {
      element.render();
    });
  }
}

const rendererDirective = directive(GridRowDetailsRendererDirective);

export const gridRowDetailsRenderer = <T>(
  renderer: GridRowDetailsLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof GridRowDetailsRendererDirective> =>
  rendererDirective(renderer as GridRowDetailsLitRenderer<unknown>, value);
