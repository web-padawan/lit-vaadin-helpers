import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { ComboBoxElement, ComboBoxItemModel } from '@vaadin/vaadin-combo-box';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type ComboBoxLitRenderer<T> = (
  item: T,
  model: ComboBoxItemModel<T>,
  comboBox: ComboBoxElement
) => TemplateResult;

class ComboBoxRendererDirective extends AbstractRendererDirective<
  ComboBoxElement,
  ComboBoxLitRenderer<unknown>
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer<T>(
    element: ComboBoxElement,
    renderer: ComboBoxLitRenderer<T>,
    options: RenderOptions
  ) {
    element.renderer = (
      root: HTMLElement,
      comboBox: ComboBoxElement,
      model: ComboBoxItemModel<T>
    ) => {
      render(renderer.call(options.host, model.item, model, comboBox), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: ComboBoxElement) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(ComboBoxRendererDirective);

export const comboBoxRenderer = <T>(
  renderer: ComboBoxLitRenderer<T>,
  value?: unknown
): DirectiveResult<typeof ComboBoxRendererDirective> =>
  rendererDirective(renderer as ComboBoxLitRenderer<unknown>, value);
