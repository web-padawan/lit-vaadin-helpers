import {
  directive,
  noChange,
  PartInfo,
  PropertyPart,
  PROPERTY_PART,
  render,
  TemplateResult
} from 'lit-html';
import type { ComboBoxElement, ComboBoxItemModel } from '@vaadin/vaadin-combo-box';
import { RendererBase } from './renderer-base';

export interface ComboBoxModel<T> {
  index: number;
  item: T;
}

export type ComboBoxRenderer<T> = (item: T, model: ComboBoxModel<T>) => TemplateResult;

const noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

class ComboBoxRendererDirective extends RendererBase {
  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  render<T, R extends ComboBoxRenderer<T>>(renderer: R, _value?: unknown) {
    return renderer;
  }

  update<T, R extends ComboBoxRenderer<T>>(part: PropertyPart, [renderer, value]: [R, unknown]) {
    if (this._initialize<T, R>(part, [renderer, value])) {
      const element = part.element as ComboBoxElement;
      const firstRender = this.isFirstRender();

      if (!this.hasChanged(value)) {
        return noChange;
      }

      this.saveValue(value);

      if (firstRender) {
        // TODO: refactor to get host from directive metadata.
        // See https://github.com/Polymer/lit-html/issues/1143
        const host = (element.getRootNode() as ShadowRoot).host;

        element.renderer = (
          root: HTMLElement,
          _comboBox: ComboBoxElement,
          model: ComboBoxItemModel
        ) => {
          render(
            this.render<T, R>(renderer, value)(model.item as T, model as ComboBoxModel<T>),
            root,
            {
              eventContext: host
            }
          );
        };
      } else {
        element.render();
        return noChange;
      }
    }

    // TODO: stub renderer to prevent errors on initial render,
    // when we do not yet have a reference to the host element.
    return noop;
  }

  private _initialize<T, R extends ComboBoxRenderer<T>>(
    part: PropertyPart,
    [renderer, value]: [R, unknown]
  ) {
    const element = part.element;
    if (element.isConnected) {
      return true;
    }
    Promise.resolve().then(() => {
      this.update<T, R>(part, [renderer, value]);
    });
    return false;
  }
}

export const comboBoxRenderer = directive(ComboBoxRendererDirective);
