import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-notification/vaadin-notification.js';
import { notificationRenderer } from '../src/index.js';

class NotificationRendererDemo extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Number }) count = 0;

  render() {
    return html`
      <vaadin-button @click=${this.toggle}>Toggle notification</vaadin-button>
      <vaadin-notification
        .opened=${this.opened}
        position="top-start"
        duration="-1"
        @opened-changed="${this.onOpenedChanged}"
        ${notificationRenderer(() => html`Opened&nbsp;<b>${this.count}</b>&nbsp;times`, this.count)}
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
