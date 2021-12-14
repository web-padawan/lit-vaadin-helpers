import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/combo-box';
import { comboBoxRenderer, ComboBoxLitRenderer } from '../index.js';

interface User {
  name: {
    first: string;
    last: string;
  };
}

class ComboBoxRendererDemo extends LitElement {
  @property({ attribute: false }) users: User[] = [
    { name: { first: 'laura', last: 'arnaud' } },
    { name: { first: 'fabien', last: 'le gall' } },
    { name: { first: 'ruben', last: 'leclercq' } },
    { name: { first: 'kelya', last: 'roy' } },
    { name: { first: 'roxane', last: 'guillaume' } },
    { name: { first: 'marius', last: 'moulin' } },
    { name: { first: 'nina', last: 'barbier' } },
    { name: { first: 'marceau', last: 'lucas' } },
    { name: { first: 'lise', last: 'barbier' } },
    { name: { first: 'louka', last: 'girard' } }
  ];

  @property({ type: String }) label = 'Status';

  @property({ type: String }) separator = ' ';

  private renderItem: ComboBoxLitRenderer<User> = (item) => {
    return html`<b>${item.name.first}${this.separator}${item.name.last}</b>`;
  };

  render() {
    return html`
      <vaadin-combo-box
        label="${this.label}"
        .items="${this.users}"
        item-value-path="name.last"
        item-label-path="name.last"
        ${comboBoxRenderer(this.renderItem, this.separator)}
      ></vaadin-combo-box>
    `;
  }
}

customElements.define('combo-box-renderer-demo', ComboBoxRendererDemo);
