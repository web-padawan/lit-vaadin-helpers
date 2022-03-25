import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@vaadin/virtual-list';
import { virtualListRenderer, VirtualListLitRenderer } from '../index.js';

interface User {
  name: {
    first: string;
    last: string;
  };
}

class VirtualListRendererDemo extends LitElement {
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

  @property({ type: String }) separator = ' ';

  @property({ type: String }) header = 'Users';

  private renderItem: VirtualListLitRenderer<User> = ({ name }, { index }, list) => {
    const items = list.items as User[];
    const last = index === items.length - 1;

    return html`
      <p data-idx="${index}">${name.first}${this.separator}${name.last}</p>
      ${last ? '' : html`<hr />`}
    `;
  };

  render() {
    return html`
      <h3>${this.header}</h3>
      <vaadin-virtual-list
        .items="${this.users}"
        ${virtualListRenderer<User>(this.renderItem, this.separator)}
        style="max-height: 200px"
      ></vaadin-virtual-list>
    `;
  }
}

customElements.define('virtual-list-renderer-demo', VirtualListRendererDemo);
