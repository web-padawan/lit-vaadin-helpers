import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { LitElement, html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/context-menu';
import '@vaadin/item';
import '@vaadin/list-box';
import type { ContextMenu, ContextMenuRendererContext } from '@vaadin/context-menu';
import type { Item } from '@vaadin/item';
import type { OverlayElement } from '@vaadin/vaadin-overlay';
import { contextMenuRenderer } from '../index.js';

class ActionSelector extends LitElement {
  @property({ type: Array }) actions = ['Edit', 'Delete'];

  @property({ type: String }) openOn = 'click';

  menuContent({ target }: ContextMenuRendererContext): TemplateResult {
    return html`
      <vaadin-list-box>
        ${this.actions.map(
          (name) => html`
            <vaadin-item .value="${name} ${target.id}" @click="${this.onItemClick}">
              ${name} ${target.id}
            </vaadin-item>
          `
        )}
      </vaadin-list-box>
    `;
  }

  render() {
    return html`
      <vaadin-context-menu
        .openOn="${this.openOn}"
        ${contextMenuRenderer(this.menuContent, this.actions)}
      >
        <div id="1">First paragraph</div>
        <div id="2">Second paragraph</div>
      </vaadin-context-menu>
    `;
  }

  onItemClick(event: Event) {
    this.dispatchEvent(new CustomEvent('item-click', { detail: { item: event.target } }));
  }
}

customElements.define('action-selector', ActionSelector);

describe('vaadin-context-menu renderer', () => {
  let wrapper: ActionSelector;
  let menu: ContextMenu;
  let overlay: OverlayElement;
  let target: HTMLElement;
  let item: Item;

  beforeEach(async () => {
    wrapper = await fixture(`<action-selector></action-selector>`);
    menu = wrapper.renderRoot.querySelector('vaadin-context-menu') as ContextMenu;
    overlay = menu.shadowRoot?.querySelector('#overlay') as OverlayElement;
    target = wrapper.renderRoot.querySelector('div') as HTMLElement;
    target.click();
    await nextFrame();
  });

  afterEach(async () => {
    menu.close();
    await nextFrame();
  });

  it('should render list-box and items when menu is opened', () => {
    expect(overlay.querySelector('vaadin-list-box')).to.be.ok;
    expect(overlay.querySelectorAll('vaadin-item').length).to.equal(2);
  });

  it('should re-render items when target element is changed', async () => {
    item = overlay.querySelector('vaadin-item') as Item;
    expect(item.value).to.equal('Edit 1');
    menu.close();
    await nextFrame();
    const second = target.nextElementSibling as HTMLElement;
    second.click();
    await nextFrame();
    item = overlay.querySelector('vaadin-item') as Item;
    expect(item.value).to.equal('Edit 2');
  });

  it('should render items when passed array is updated', async () => {
    const spy = sinon.spy(menu, 'requestContentUpdate');
    wrapper.actions = [...wrapper.actions, 'Copy'];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(overlay.querySelectorAll('vaadin-item').length).to.equal(3);
  });

  it('should remove items when passed array is cleared', async () => {
    const spy = sinon.spy(menu, 'requestContentUpdate');
    wrapper.actions = [];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(overlay.querySelectorAll('vaadin-item').length).to.equal(0);
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(menu, 'requestContentUpdate');
    wrapper.openOn = 'keydown';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', () => {
    const spy = sinon.spy();
    wrapper.addEventListener('item-click', spy);
    item = overlay.querySelector('vaadin-item') as Item;
    item.click();
    expect(spy.callCount).to.equal(1);
    expect(spy.firstCall.args[0].detail.item).to.deep.equal(item);
  });
});
