import { LitElement, html } from 'lit-element';
import { property } from 'lit-element/lib/decorators/property.js';
import '@vaadin/vaadin-context-menu/vaadin-context-menu.js';
import '@vaadin/vaadin-list-box/vaadin-list-box.js';
import '@vaadin/vaadin-item/vaadin-item.js';
import type { ItemElement } from '@vaadin/vaadin-item';
import { renderer } from '../src/renderer';

class ContextMenuRendererDemo extends LitElement {
  @property({ type: Array }) actions = ['Edit', 'Delete'];

  @property({ type: String }) selectedAction = '';

  render() {
    return html`
      <vaadin-context-menu
        .renderer="${renderer(
          () => html`
            <vaadin-list-box>
              ${this.actions.map(
                (name) => html`<vaadin-item value="${name}" @click="${this.onItemClick}">
                  ${name}
                </vaadin-item>`
              )}
            </vaadin-list-box>
          `,
          this.actions
        )}"
      >
        <p>This paragraph has the context menu created using renderer function.</p>
      </vaadin-context-menu>
      <p>Selected action: ${this.selectedAction}</p>
    `;
  }

  onItemClick(e: Event) {
    this.selectedAction = (e.target as ItemElement).value;
  }
}

customElements.define('context-menu-renderer-demo', ContextMenuRendererDemo);
