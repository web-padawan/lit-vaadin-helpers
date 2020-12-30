import { LitElement, html } from 'lit-element';
import { property } from 'lit-element/decorators.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';
import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import type { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { renderer } from '../src/renderer';

class DialogRendererDemo extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: String }) selectedDate = '';

  render() {
    return html`
      <p>Selected date: ${this.selectedDate}</p>
      <vaadin-button @click="${this.toggle}">Toggle dialog</vaadin-button>
      <vaadin-dialog
        .opened=${this.opened}
        .renderer=${renderer(
          () => html`
            <vaadin-date-picker
              label="Select date"
              @change="${this.onDateChange}"
            ></vaadin-date-picker>
          `
        )}
        @opened-changed="${this.onOpenedChanged}"
        modeless
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
