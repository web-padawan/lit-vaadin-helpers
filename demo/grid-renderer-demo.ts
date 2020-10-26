import { LitElement, html, TemplateResult } from 'lit-element';
import { property } from 'lit-element/lib/decorators/property.js';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-text-field';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
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

  @property({ type: String }) label = 'Filter first name';

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
        .rowDetailsRenderer="${gridRenderer((model: GridModel<User>) => {
          return html`User name: ${model.item.username}. Phone: ${model.item.phone}`;
        })}"
      >
        <vaadin-grid-column
          header="#"
          flex-grow="0"
          width="60px"
          text-align="end"
          .renderer="${gridRenderer((model: GridModel<User>) => html`${model.index}`)}"
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            header="First"
            .renderer="${gridRenderer(
              (model: GridModel<User>) => {
                const name = model.item.name.first;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}"
          ></vaadin-grid-column>
          <vaadin-grid-column path="name.last"></vaadin-grid-column>
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
            (model: GridModel<User>) => {
              const user = model.item;
              return html`
                <vaadin-checkbox
                  @checked-changed="${(event: CustomEvent) => {
                    if (event.detail.value) {
                      // show user details
                      this.detailsOpened = [...this.detailsOpened, user];
                    } else if (this.detailsOpened.length) {
                      // hide user details
                      this.detailsOpened = this.detailsOpened.filter(
                        (item) => item.username !== user.username
                      );
                    }
                  }}"
                ></vaadin-checkbox>
              `;
            },
            [this.detailsOpened]
          )}"
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
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
