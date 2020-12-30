import { LitElement, html } from 'lit-element';
import { property } from 'lit-element/decorators.js';
import '@vaadin/vaadin-combo-box/vaadin-combo-box.js';
import { comboBoxRenderer } from '../src/combo-box-renderer';

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

  render() {
    return html`
      <vaadin-combo-box
        label="${this.label}"
        .items="${this.users}"
        .renderer="${comboBoxRenderer<User>(
          (item) => html`<b>${item.name.first}${this.separator}${item.name.last}</b>`,
          this.separator
        )}"
        item-value-path="name.last"
        item-label-path="name.last"
      ></vaadin-combo-box>
    `;
  }
}

customElements.define('combo-box-renderer-demo', ComboBoxRendererDemo);
