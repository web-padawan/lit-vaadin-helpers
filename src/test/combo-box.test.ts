import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { PolymerElement } from '@polymer/polymer';
import '@vaadin/combo-box';
import type { ComboBox } from '@vaadin/combo-box';
import type { OverlayElement } from '@vaadin/vaadin-overlay';
import { comboBoxRenderer, ComboBoxLitRenderer } from '../index.js';

interface User {
  name: {
    first: string;
    last: string;
  };
}

class UserSelector extends LitElement {
  @property({ attribute: false }) users: User[] = [
    { name: { first: 'laura', last: 'arnaud' } },
    { name: { first: 'fabien', last: 'le gall' } },
    { name: { first: 'ruben', last: 'leclercq' } },
    { name: { first: 'kelya', last: 'roy' } },
    { name: { first: 'roxane', last: 'guillaume' } },
    { name: { first: 'marius', last: 'moulin' } },
    { name: { first: 'nina', last: 'barbier' } },
    { name: { first: 'marceau', last: 'lucas' } },
    { name: { first: 'lise', last: 'barbier' } },
    { name: { first: 'louka', last: 'girard' } }
  ];

  @property({ type: String }) label = 'Status';

  @property({ type: String }) separator = ' ';

  private renderItem: ComboBoxLitRenderer<User> = ({ name }) => {
    return html`<b @click="${this.onItemClick}">${name.first}${this.separator}${name.last}</b>`;
  };

  render() {
    return html`
      <vaadin-combo-box
        label="${this.label}"
        .items="${this.users}"
        item-value-path="name.last"
        item-label-path="name.last"
        ${comboBoxRenderer(this.renderItem, this.separator)}
      ></vaadin-combo-box>
    `;
  }

  onItemClick(event: Event) {
    const item = (event.target as HTMLElement).closest('vaadin-combo-box-item');
    this.dispatchEvent(new CustomEvent('item-click', { detail: { item } }));
  }
}

customElements.define('user-selector', UserSelector);

const strip = (str: string): string => {
  // strip lit-html marker comments
  return str.replace(/<!--[^>]*-->/g, '').trim();
};

describe('vaadin-combo-box renderer', () => {
  let wrapper: UserSelector;
  let comboBox: ComboBox;
  let item: PolymerElement;

  beforeEach(async () => {
    wrapper = await fixture(`<user-selector></user-selector>`);
    comboBox = wrapper.renderRoot.querySelector('vaadin-combo-box') as ComboBox;
    comboBox.opened = true;
    await nextFrame();
    const dropdown = (comboBox as unknown as PolymerElement).$.dropdown as PolymerElement;
    const overlay = dropdown.$.overlay as OverlayElement;
    item = overlay.querySelector('vaadin-combo-box-item') as PolymerElement;
  });

  afterEach(async () => {
    comboBox.opened = false;
    await nextFrame();
  });

  it('should render items properly when renderer is set', () => {
    expect(strip(item.innerHTML)).to.equal('<b>laura arnaud</b>');
  });

  it('should render items when passed property is updated', async () => {
    const spy = sinon.spy(comboBox, 'requestContentUpdate');
    wrapper.separator = '_';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(strip(item.innerHTML)).to.equal('<b>laura_arnaud</b>');
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(comboBox, 'requestContentUpdate');
    wrapper.label = 'New label';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', () => {
    const spy = sinon.spy();
    wrapper.addEventListener('item-click', spy);
    const child = item.querySelector('b') as HTMLElement;
    child.click();
    expect(spy.callCount).to.equal(1);
    expect(spy.firstCall.args[0].detail.item).to.deep.equal(item);
  });
});
