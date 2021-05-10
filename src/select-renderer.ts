import { nothing, ElementPart, render, RenderOptions } from 'lit';
import { directive, PartInfo, PartType } from 'lit/directive.js';
import { SelectElement } from '@vaadin/vaadin-select';
import { Renderer, RendererBase } from './renderer-base.js';

class SelectRendererDirective extends RendererBase<SelectElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: Renderer, _value?: unknown) {
    return renderer();
  }

  update(part: ElementPart, [renderer, value]: [Renderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: SelectElement,
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement) => {
      render(this.render(renderer, value), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: SelectElement) {
    element.render();
  }
}

export const selectRenderer = directive(SelectRendererDirective);
