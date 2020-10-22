import { LitElement, html } from 'lit-element';
import { property } from 'lit-element/lib/decorators/property.js';
import '@vaadin/vaadin-select';
import '@vaadin/vaadin-list-box';
import '@vaadin/vaadin-item';
import { renderer } from '../src/renderer';

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
        .renderer="${renderer(
          this.statuses,
          () => html`
            <vaadin-list-box>
              ${this.statuses.map(({ name }) => {
                return html`<vaadin-item value="${name}">${name}</vaadin-item>`;
              })}
            </vaadin-list-box>
          `
        )}"
      >
      </vaadin-select>
    `;
  }
}

customElements.define('select-renderer-demo', SelectRendererDemo);
