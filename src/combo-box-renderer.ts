import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { ComboBoxElement, ComboBoxItemModel } from '@vaadin/vaadin-combo-box';
import { ElementWithRenderer, Renderer, RendererBase } from './renderer-base.js';

export interface ComboBoxModel<T> {
  index: number;
  item: T;
}

export type ComboBoxLitRenderer<T> = (item: T, model: ComboBoxModel<T>) => TemplateResult;

class ComboBoxRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: ComboBoxLitRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [ComboBoxLitRenderer<T>, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: ElementWithRenderer,
    renderer: Renderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      _comboBox: ComboBoxElement,
      model: ComboBoxItemModel
    ) => {
      render(
        this.render<T>(renderer, value)(model.item as T, model as ComboBoxModel<T>),
        root,
        options
      );
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: ElementWithRenderer) {
    element.render();
  }
}

const rendererDirective = directive(ComboBoxRendererDirective);

export const comboBoxRenderer = <T>(
  renderer: ComboBoxLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof ComboBoxRendererDirective> =>
  rendererDirective(renderer as ComboBoxLitRenderer<unknown>, value);
