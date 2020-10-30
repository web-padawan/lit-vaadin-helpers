import { LitElement, html, TemplateResult } from 'lit-element';
import { property } from 'lit-element/lib/decorators/property.js';
import { query } from 'lit-element/lib/decorators/query.js';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-text-field';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { GridElement, GridEventContext } from '@vaadin/vaadin-grid';
import { gridRenderer, GridModel } from '../src/grid-renderer';

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

  @query('vaadin-grid') grid!: GridElement;

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
        .rowDetailsRenderer="${gridRenderer(
          (item: User) => html`User name: ${item.username}. Phone: ${item.phone}`
        )}"
      >
        <vaadin-grid-column
          header="#"
          flex-grow="0"
          width="60px"
          text-align="end"
          .renderer="${gridRenderer((_item: User, model: GridModel<User>) => html`${model.index}`)}"
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            header="First"
            .renderer="${gridRenderer(
              (item: User) => {
                const name = item.name.first;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}"
          ></vaadin-grid-column>
          <vaadin-grid-column
            header="Last"
            .renderer="${gridRenderer(
              (item: User) => {
                const name = item.name.last;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}"
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
          .renderer="${gridRenderer(
            () => html`<vaadin-checkbox @change="${this.toggleDetails}"></vaadin-checkbox>`
          )}"
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  toggleDetails(event: CustomEvent) {
    const target = event.target as CheckboxElement;
    const context = this.grid.getEventContext(event) as GridEventContext;
    const user = context.item as User;
    if (target.checked) {
      // show user details
      this.detailsOpened = [...this.detailsOpened, user];
    } else if (this.detailsOpened.length) {
      // hide user details
      this.detailsOpened = this.detailsOpened.filter((item) => item.username !== user.username);
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
