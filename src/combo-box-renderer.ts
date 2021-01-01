import { nothing, ElementPart, render, TemplateResult } from 'lit-html';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit-html/directive.js';
import { ComboBoxItemModel } from '@vaadin/vaadin-combo-box';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { RendererBase } from './renderer-base';

export interface ComboBoxModel<T> {
  index: number;
  item: T;
}

export type ComboBoxRenderer<T> = (item: T, model: ComboBoxModel<T>) => TemplateResult;

class ComboBoxRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: ComboBoxRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: ElementPart, [renderer, value]: [ComboBoxRenderer<T>, unknown]) {
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return nothing;
    }

    this.saveValue(value);

    const element = part.element;
    if (element instanceof ComboBoxElement) {
      // TODO: support re-assigning renderer function.
      if (firstRender) {
        const host = part.options?.host;
        element.renderer = (
          root: HTMLElement,
          _comboBox: ComboBoxElement,
          model: ComboBoxItemModel
        ) => {
          render(
            this.render<T>(renderer, value)(model.item as T, model as ComboBoxModel<T>),
            root,
            { host }
          );
        };
      } else {
        element.render();
      }
    }

    return nothing;
  }
}

const rendererDirective = directive(ComboBoxRendererDirective);

export const comboBoxRenderer = <T>(
  renderer: ComboBoxRenderer<T>,
  value?: unknown
): DirectiveResult<typeof ComboBoxRendererDirective> =>
  rendererDirective(renderer as ComboBoxRenderer<unknown>, value);
