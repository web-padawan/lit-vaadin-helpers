import { LitElement, html, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column-group.js';
import '@vaadin/checkbox';
import '@vaadin/text-field';
import type { Checkbox } from '@vaadin/checkbox';
import type { TextField } from '@vaadin/text-field';
import type { Grid, GridEventContext } from '@vaadin/grid';
import {
  columnBodyRenderer,
  columnHeaderRenderer,
  columnFooterRenderer,
  gridRowDetailsRenderer
} from '../index.js';

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

  @query('vaadin-grid') grid!: Grid<User>;

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
        ${gridRowDetailsRenderer<User>(
          (item) => html`User name: ${item.username}. Phone: ${item.phone}`
        )}
      >
        <vaadin-grid-column
          header="#"
          flex-grow="0"
          width="60px"
          text-align="end"
          ${columnBodyRenderer<User>((_item, model) => html`${model.index}`)}
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            ${columnHeaderRenderer(() => html`<b>First</b>`)}
            ${columnFooterRenderer(() => html`<b>First</b>`)}
            ${columnBodyRenderer<User>(
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
            ${columnBodyRenderer<User>(
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
          ${columnBodyRenderer(
            () => html`<vaadin-checkbox @change="${this.toggleDetails}"></vaadin-checkbox>`
          )}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  toggleDetails(event: CustomEvent) {
    const target = event.target as Checkbox;
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
    fetch('/data/data.json')
      .then((r) => r.json())
      .then((data) => {
        this.users = data;
      });
  }

  onChange(event: Event) {
    this.filter = (event.target as TextField).value;
  }
}

customElements.define('grid-renderer-demo', GridRendererDemo);
