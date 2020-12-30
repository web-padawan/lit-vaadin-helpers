import { LitElement, html } from 'lit-element';
import { property } from 'lit-element/decorators.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-notification/vaadin-notification.js';
import { renderer } from '../src/renderer';

class NotificationRendererDemo extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Number }) count = 0;

  render() {
    return html`
      <vaadin-button @click=${this.toggle}>Toggle notification</vaadin-button>
      <vaadin-notification
        .opened=${this.opened}
        .renderer="${renderer(() => html`Opened&nbsp;<b>${this.count}</b>&nbsp;times`, this.count)}"
        position="top-start"
        duration="-1"
        @opened-changed="${this.onOpenedChanged}"
      ></vaadin-notification>
    `;
  }

  onOpenedChanged(e: CustomEvent) {
    // upward property binding
    this.opened = e.detail.value;
  }

  toggle() {
    this.opened = !this.opened;
    if (this.opened) {
      this.count += 1;
    }
  }
}

customElements.define('notification-renderer-demo', NotificationRendererDemo);
