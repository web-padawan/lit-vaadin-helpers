import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { VirtualList, VirtualListItemModel } from '@vaadin/virtual-list';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type VirtualListLitRenderer<T> = (
  item: T,
  model: VirtualListItemModel<T>,
  list: VirtualList<T>
) => TemplateResult;

class VirtualListRendererDirective extends AbstractRendererDirective<
  VirtualList,
  VirtualListLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: VirtualList<T>,
    renderer: VirtualListLitRenderer<T>,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      list: VirtualList<T>,
      model: VirtualListItemModel<T>
    ) => {
      render(renderer.call(options.host, model.item, model, list as VirtualList<T>), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: VirtualList) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(VirtualListRendererDirective);

export const virtualListRenderer = <T>(
  renderer: VirtualListLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof VirtualListRendererDirective> =>
  rendererDirective(renderer as VirtualListLitRenderer<unknown>, value);
