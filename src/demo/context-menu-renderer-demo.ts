import { LitElement, html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/context-menu';
import '@vaadin/item';
import '@vaadin/list-box';
import type { Item } from '@vaadin/item';
import { contextMenuRenderer } from '../index.js';
import { ContextMenuRendererContext } from '@vaadin/context-menu';

class ContextMenuRendererDemo extends LitElement {
  @property({ type: Array }) actions = ['Edit', 'Delete'];

  @property({ type: String }) selectedAction = '';

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
      <vaadin-context-menu ${contextMenuRenderer(this.menuContent, this.actions)}>
        <div id="1">First paragraph with the context-menu.</div>
        <div id="2">Second paragraph which uses the same context menu.</div>
      </vaadin-context-menu>
      <p>Selected action: ${this.selectedAction}</p>
    `;
  }

  onItemClick(e: Event) {
    this.selectedAction = (e.target as Item).value;
  }
}

customElements.define('context-menu-renderer-demo', ContextMenuRendererDemo);
