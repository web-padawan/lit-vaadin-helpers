import { LitElement, html, property, TemplateResult } from 'lit-element';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-text-field';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { User, HasFilter } from './types';
import { controller, GridController } from '../src/grid-controller-spread.js';

const usersController: GridController<User, HasFilter> = {
  columns: [
    {
      header: '#',
      textAlign: 'end',
      width: '60px',
      flexGrow: 0,
      renderer: (model) => html`${model.index}`
    },
    {
      header: 'Name',
      columns: [
        {
          header: 'First',
          renderer: (model, { filter }) => {
            const name = model.item.name.first;
            const match = filter && name.indexOf(filter) > -1;
            return match ? html`<b>${name}</b>` : html`${name}`;
          },
          width: 'calc(20% - 12px)'
        },
        {
          path: 'name.last',
          width: 'calc(20% - 12px)'
        }
      ]
    },
    {
      header: 'Location',
      columns: [
        {
          path: 'location.city',
          width: 'calc(20% - 12px)'
        },
        {
          path: 'location.state',
          width: 'calc(20% - 12px)'
        },
        {
          path: 'location.street',
          width: 'calc(20% - 12px)'
        }
      ]
    }
  ]
};

class GridControllerSpreadDemo extends LitElement implements HasFilter {
  @property({ attribute: false }) users!: User[];

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
        ...="${controller(usersController, this.filter)}"
      ></vaadin-grid>
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

customElements.define('grid-controller-spread-demo', GridControllerSpreadDemo);
