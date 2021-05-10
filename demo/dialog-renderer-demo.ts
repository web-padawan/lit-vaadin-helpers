import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';
import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import type { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { dialogRenderer } from '../src/index.js';

class DialogRendererDemo extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: String }) selectedDate = '';

  render() {
    return html`
      <p>Selected date: ${this.selectedDate}</p>
      <vaadin-button @click="${this.toggle}">Toggle dialog</vaadin-button>
      <vaadin-dialog
        .opened=${this.opened}
        @opened-changed="${this.onOpenedChanged}"
        modeless
        ${dialogRenderer(
          () => html`
            <vaadin-date-picker
              label="Select date"
              @change="${this.onDateChange}"
            ></vaadin-date-picker>
          `
        )}
      ></vaadin-dialog>
    `;
  }

  onDateChange(e: Event) {
    const target = e.target as DatePickerElement;
    this.selectedDate = target.value;
  }

  onOpenedChanged(e: CustomEvent) {
    // upward property binding
    this.opened = e.detail.value;
  }

  toggle() {
    this.opened = !this.opened;
  }
}

customElements.define('dialog-renderer-demo', DialogRendererDemo);
