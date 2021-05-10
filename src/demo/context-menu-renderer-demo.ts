import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/vaadin-context-menu/vaadin-context-menu.js';
import '@vaadin/vaadin-list-box/vaadin-list-box.js';
import '@vaadin/vaadin-item/vaadin-item.js';
import type { ItemElement } from '@vaadin/vaadin-item';
import { contextMenuRenderer, ContextMenuLitRenderer } from '../index.js';

class ContextMenuRendererDemo extends LitElement {
  @property({ type: Array }) actions = ['Edit', 'Delete'];

  @property({ type: String }) selectedAction = '';

  private menuContent!: ContextMenuLitRenderer;

  constructor() {
    super();

    this.menuContent = ({ target }) => html`
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
      <vaadin-context-menu ${contextMenuRenderer(this.menuContent, this.actions)}>
        <div id="1">First paragraph with the context-menu.</div>
        <div id="2">Second paragraph which uses the same context menu.</div>
      </vaadin-context-menu>
      <p>Selected action: ${this.selectedAction}</p>
    `;
  }

  onItemClick(e: Event) {
    this.selectedAction = (e.target as ItemElement).value;
  }
}

customElements.define('context-menu-renderer-demo', ContextMenuRendererDemo);
