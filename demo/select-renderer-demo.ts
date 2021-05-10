import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/vaadin-select';
import '@vaadin/vaadin-list-box';
import '@vaadin/vaadin-item';
import { selectRenderer } from '../src/index.js';

class SelectRendererDemo extends LitElement {
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

customElements.define('select-renderer-demo', SelectRendererDemo);
