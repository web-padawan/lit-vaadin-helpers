import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { SelectElement } from '@vaadin/vaadin-select';
import type { OverlayElement } from '@vaadin/vaadin-overlay';
import '@vaadin/vaadin-select';
import '@vaadin/vaadin-list-box';
import '@vaadin/vaadin-item';
import { selectRenderer } from '../index.js';

class StatusSelector extends LitElement {
  @property({ attribute: false }) statuses = [
    { name: 'waiting' },
    { name: 'error' },
    { name: 'completed' }
  ];

  @property({ type: String }) label = 'Status';

  render() {
    return html`
      <vaadin-select
        label="${this.label}"
        ${selectRenderer(
          () => html`
            <vaadin-list-box>
              ${this.statuses.map(
                ({ name }) => html`<vaadin-item value="${name}" @click="${this.onItemClick}">
                  ${name}
                </vaadin-item>`
              )}
            </vaadin-list-box>
          `,
          this.statuses
        )}
      ></vaadin-select>
    `;
  }

  onItemClick(event: Event) {
    this.dispatchEvent(new CustomEvent('item-click', { detail: { item: event.target } }));
  }
}

customElements.define('status-selector', StatusSelector);

describe('vaadin-select renderer', () => {
  let wrapper: StatusSelector;
  let select: SelectElement;
  let overlay: OverlayElement;
  let content: HTMLElement;

  beforeEach(async () => {
    wrapper = await fixture(`<status-selector></status-selector>`);
    select = wrapper.renderRoot.querySelector('vaadin-select') as SelectElement;
    overlay = select.shadowRoot!.querySelector('vaadin-select-overlay') as OverlayElement;
    content = overlay.content as HTMLElement;
  });

  it('should render list-box and items when select is closed', () => {
    expect(content.querySelector('vaadin-list-box')).to.be.ok;
    expect(content.querySelectorAll('vaadin-item').length).to.equal(3);
  });

  it('should render items when passed array is updated', async () => {
    const spy = sinon.spy(select, 'render');
    wrapper.statuses = [...wrapper.statuses, { name: 'new' }];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(content.querySelectorAll('vaadin-item').length).to.equal(4);
  });

  it('should remove items when passed array is cleared', async () => {
    const spy = sinon.spy(select, 'render');
    wrapper.statuses = [];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(content.querySelectorAll('vaadin-item').length).to.equal(0);
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(select, 'render');
    wrapper.label = 'New label';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', () => {
    const spy = sinon.spy();
    wrapper.addEventListener('item-click', spy);
    const item = content.querySelector('vaadin-item')!;
    item.click();
    expect(spy.callCount).to.equal(1);
    expect(spy.firstCall.args[0].detail.item).to.deep.equal(item);
  });
});
