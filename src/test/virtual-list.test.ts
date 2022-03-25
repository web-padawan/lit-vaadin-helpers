import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { VirtualList } from '@vaadin/virtual-list';
import '@vaadin/virtual-list';
import { virtualListRenderer, VirtualListLitRenderer } from '../index.js';

interface User {
  name: {
    first: string;
    last: string;
  };
}

class ListWrapper extends LitElement {
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

  @property({ type: String }) separator = ' ';

  @property({ type: String }) header = 'Users';

  private renderItem: VirtualListLitRenderer<User> = ({ name }, { index }) => {
    return html`
      <p @click="${this.onItemClick}" data-idx="${index}">
        ${name.first}${this.separator}${name.last}
      </p>
    `;
  };

  render() {
    return html`
      <h3>${this.header}</h3>
      <vaadin-virtual-list
        .items="${this.users}"
        ${virtualListRenderer<User>(this.renderItem, this.separator)}
      ></vaadin-virtual-list>
    `;
  }

  onItemClick(event: Event) {
    this.dispatchEvent(new CustomEvent('item-click', { detail: { item: event.target } }));
  }
}

customElements.define('list-wrapper', ListWrapper);

describe('virtual-list renderer', () => {
  let wrapper: ListWrapper;
  let list: VirtualList;
  let items: HTMLElement[];

  beforeEach(async () => {
    wrapper = fixtureSync(`<list-wrapper></list-wrapper>`);
    await wrapper.updateComplete;
    list = wrapper.renderRoot.querySelector('vaadin-virtual-list') as VirtualList;
    items = Array.from(list.querySelectorAll('p'));
  });

  it('should render items properly when renderer is set', () => {
    items.forEach((child, idx) => {
      expect(child.dataset.idx).to.equal(idx.toString());
    });
  });

  it('should render items when passed property is updated', async () => {
    const spy = sinon.spy(list, 'requestContentUpdate');
    wrapper.separator = '_';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(items[0].textContent?.trim()).to.equal('laura_arnaud');
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(list, 'requestContentUpdate');
    wrapper.header = 'Customers';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', () => {
    const spy = sinon.spy();
    wrapper.addEventListener('item-click', spy);
    const item = items[0];
    item.click();
    expect(spy.callCount).to.equal(1);
    expect(spy.firstCall.args[0].detail.item).to.deep.equal(item);
  });
});
