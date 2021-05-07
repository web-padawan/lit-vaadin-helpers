import { LitElement, html, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-text-field';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { GridElement, GridEventContext } from '@vaadin/vaadin-grid';
import { rowDetailsRenderer } from '../src/grid-row-details-renderer';
import { bodyRenderer } from '../src/grid-column-body-renderer';
import { headerRenderer } from '../src/grid-column-header-renderer';
import { footerRenderer } from '../src/grid-column-footer-renderer';

interface User {
  name: {
    first: string;
    last: string;
  };
  location: {
    street: string;
    city: string;
  };
  username: string;
  phone: string;
}

class GridRendererDemo extends LitElement {
  @property({ attribute: false }) users!: User[];

  @property({ attribute: false }) detailsOpened: User[] = [];

  @property({ type: String }) filter = '';

  @property({ type: String }) label = 'Filter';

  @query('vaadin-grid') grid!: GridElement<User>;

  render(): TemplateResult {
    return html`
      <vaadin-text-field
        label="${this.label}"
        .value="${this.filter}"
        @change="${this.onChange}"
      ></vaadin-text-field>
      <vaadin-grid
        .items="${this.users}"
        .detailsOpenedItems="${this.detailsOpened}"
        ${rowDetailsRenderer<User>(
          (item) => html`User name: ${item.username}. Phone: ${item.phone}`
        )}
      >
        <vaadin-grid-column
          header="#"
          flex-grow="0"
          width="60px"
          text-align="end"
          ${bodyRenderer<User>((_item, model) => html`${model.index}`)}
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            ${headerRenderer(() => html`<b>First</b>`)}
            ${footerRenderer(() => html`<b>First</b>`)}
            ${bodyRenderer<User>(
              (item) => {
                const name = item.name.first;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}
          ></vaadin-grid-column>
          <vaadin-grid-column
            header="Last"
            ${bodyRenderer<User>(
              (item) => {
                const name = item.name.last;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}
          ></vaadin-grid-column>
        </vaadin-grid-column-group>
        <vaadin-grid-column-group header="Location">
          <vaadin-grid-column path="location.city"></vaadin-grid-column>
          <vaadin-grid-column path="location.state"></vaadin-grid-column>
          <vaadin-grid-column path="location.street"></vaadin-grid-column>
        </vaadin-grid-column-group>
        <vaadin-grid-column
          header="Details"
          flex-grow="0"
          width="90px"
          ${bodyRenderer(
            () => html`<vaadin-checkbox @change="${this.toggleDetails}"></vaadin-checkbox>`
          )}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  toggleDetails(event: CustomEvent) {
    const target = event.target as CheckboxElement;
    const context = this.grid.getEventContext(event) as GridEventContext<User>;
    const user = context.item;
    if (user) {
      if (target.checked) {
        // show user details
        this.detailsOpened = [...this.detailsOpened, user];
      } else if (this.detailsOpened.length) {
        // hide user details
        this.detailsOpened = this.detailsOpened.filter((item) => item.username !== user.username);
      }
    }
  }

  firstUpdated() {
    fetch('./data.json')
      .then((r) => r.json())
      .then((data) => {
        this.users = data;
      });
  }

  onChange(event: Event) {
    this.filter = (event.target as TextFieldElement).value;
  }
}

customElements.define('grid-renderer-demo', GridRendererDemo);
