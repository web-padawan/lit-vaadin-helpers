import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { Dialog } from '@vaadin/dialog';
import type { OverlayElement } from '@vaadin/vaadin-overlay';
import '@vaadin/dialog';
import { dialogRenderer } from '../index.js';

class ActionsWrapper extends LitElement {
  @property({ attribute: false }) actions = ['New', 'Edit'];

  @property({ type: Boolean }) modal = true;

  @property({ type: Boolean }) opened = false;

  render() {
    return html`
      <vaadin-dialog
        .opened="${this.opened}"
        .modeless="${!this.modal}"
        ${dialogRenderer(
          () => html`
            ${this.actions.map(
              (action) => html`<button @click="${this.onActionClick}">${action}</button>`
            )}
          `,
          this.actions
        )}
      ></vaadin-dialog>
    `;
  }

  onActionClick(event: Event) {
    this.dispatchEvent(new CustomEvent('item-click', { detail: { button: event.target } }));
  }
}

customElements.define('actions-wrapper', ActionsWrapper);

describe('vaadin-dialog renderer', () => {
  let wrapper: ActionsWrapper;
  let dialog: Dialog;
  let overlay: OverlayElement;

  beforeEach(async () => {
    wrapper = await fixture(`<actions-wrapper></actions-wrapper>`);
    dialog = wrapper.renderRoot.querySelector('vaadin-dialog') as Dialog;
    overlay = dialog.shadowRoot!.querySelector('vaadin-dialog-overlay') as OverlayElement;
    wrapper.opened = true;
    await wrapper.updateComplete;
    await nextFrame();
  });

  it('should render dialog content when opened', () => {
    expect(overlay.querySelectorAll('button').length).to.equal(2);
  });

  it('should re-render content on passed property change', async () => {
    const spy = sinon.spy(dialog, 'requestContentUpdate');
    wrapper.actions = [...wrapper.actions, 'Delete'];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(overlay.querySelectorAll('button').length).to.equal(3);
  });

  it('should clear content when passed property is cleared', async () => {
    const spy = sinon.spy(dialog, 'requestContentUpdate');
    wrapper.actions = [];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
    expect(overlay.querySelectorAll('button').length).to.equal(0);
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(dialog, 'requestContentUpdate');
    wrapper.modal = false;
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', () => {
    const spy = sinon.spy();
    wrapper.addEventListener('item-click', spy);
    const button = overlay.querySelector('button')!;
    button.click();
    expect(spy.callCount).to.equal(1);
    expect(spy.firstCall.args[0].detail.button).to.deep.equal(button);
  });
});
