import { LitElement, html, property, TemplateResult } from 'lit-element';
import { guard } from 'lit-html/directives/guard';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-text-field';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { User, HasFilter } from './types';
import type { GridRenderer } from '../src/grid-renderer-property';
import '../src/grid-renderer-property';

const indexRenderer: GridRenderer<User, HasFilter> = (model) => html`${model.index}`;

const firstNameRenderer: GridRenderer<User, HasFilter> = (model, { filter }) => {
  const name = model.item.name.first;
  const match = filter && name.indexOf(filter) > -1;
  return match ? html`<b>${name}</b>` : html`${name}`;
};

class GridRendererPropertyDemo extends LitElement implements HasFilter {
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
      <vaadin-grid .items="${this.users}">
        <vaadin-grid-column
          header="#"
          flex-grow="0"
          width="60px"
          text-align="end"
          .litRenderer="${guard([], () => indexRenderer)}"
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            header="First"
            width="calc(20% - 12px)"
            .litRenderer="${guard([this.filter], () => firstNameRenderer)}"
          ></vaadin-grid-column>
          <vaadin-grid-column path="name.last" width="calc(20% - 12px)"></vaadin-grid-column>
        </vaadin-grid-column-group>
        <vaadin-grid-column-group header="Location">
          <vaadin-grid-column path="location.city" width="calc(20% - 12px)"></vaadin-grid-column>
          <vaadin-grid-column path="location.state" width="calc(20% - 12px)"></vaadin-grid-column>
          <vaadin-grid-column path="location.street" width="calc(20% - 12px)"></vaadin-grid-column>
        </vaadin-grid-column-group>
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

customElements.define('grid-renderer-property-demo', GridRendererPropertyDemo);
