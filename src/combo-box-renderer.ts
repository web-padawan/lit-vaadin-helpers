import { noChange, PropertyPart, render, TemplateResult } from 'lit-html';
import { directive, PartInfo, PartType } from 'lit-html/directive.js';
import type { ComboBoxElement, ComboBoxItemModel } from '@vaadin/vaadin-combo-box';
import { RendererBase } from './renderer-base';

export interface ComboBoxModel<T> {
  index: number;
  item: T;
}

export type ComboBoxRenderer<T> = (item: T, model: ComboBoxModel<T>) => TemplateResult;

class ComboBoxRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.PROPERTY || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render<T>(renderer: ComboBoxRenderer<T>, _value?: unknown) {
    return renderer;
  }

  update<T>(part: PropertyPart, [renderer, value]: [ComboBoxRenderer<T>, unknown]) {
    const host = part.options?.host;
    const firstRender = this.isFirstRender();

    if (!this.hasChanged(value)) {
      return noChange;
    }

    this.saveValue(value);

    if (firstRender) {
      return (root: HTMLElement, _comboBox: ComboBoxElement, model: ComboBoxItemModel) => {
        render(this.render<T>(renderer, value)(model.item as T, model as ComboBoxModel<T>), root, {
          host
        });
      };
    } else {
      const element = part.element as ComboBoxElement;
      element.render();
      return noChange;
    }
  }
}

const rendererDirective = directive(ComboBoxRendererDirective);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const comboBoxRenderer = <T>(renderer: ComboBoxRenderer<T>, value?: unknown) =>
  rendererDirective(renderer as ComboBoxRenderer<unknown>, value);
