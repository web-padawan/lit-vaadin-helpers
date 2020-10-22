import { LitElement, html, TemplateResult } from 'lit-element';
import { property } from 'lit-element/lib/decorators/property.js';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-text-field';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import { gridRenderer } from '../src/grid-renderer';

interface User {
  name: {
    first: string;
    last: string;
  };
  location: {
    street: string;
    city: string;
  };
}

class GridRendererDemo extends LitElement implements HasFilter {
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
          .renderer="${gridRenderer((model) => html`${model.index}`)}"
        ></vaadin-grid-column>
        <vaadin-grid-column-group header="Name">
          <vaadin-grid-column
            header="First"
            width="calc(20% - 12px)"
            .renderer="${gridRenderer(
              (model) => {
                // TODO: fix directive to accept generic type
                const name = (model.item as User).name.first;
                const match = this.filter && name.indexOf(this.filter) > -1;
                return match ? html`<b>${name}</b>` : html`${name}`;
              },
              [this.filter]
            )}"
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

customElements.define('grid-renderer-demo', GridRendererDemo);
