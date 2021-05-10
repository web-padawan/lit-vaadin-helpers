import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement, html, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column-group';
import '@vaadin/vaadin-checkbox';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { GridElement, GridEventContext } from '@vaadin/vaadin-grid';
import { columnBodyRenderer, columnHeaderRenderer, gridRowDetailsRenderer } from '../index.js';

interface User {
  name: {
    first: string;
    last: string;
  };
}

class UserInfo extends LitElement {
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

  @property({ attribute: false }) detailsOpened: User[] = [];

  @property({ type: String }) filter = '';

  @property({ type: String }) label = 'Filter';

  @query('vaadin-grid') grid!: GridElement<User>;

  render(): TemplateResult {
    return html`
      <vaadin-grid
        .items="${this.users}"
        .detailsOpenedItems="${this.detailsOpened}"
        ${gridRowDetailsRenderer<User>((item) => html`${item.name.first} ${item.name.last}`)}
      >
        <vaadin-grid-column
          ${columnHeaderRenderer(() => html`<b>First</b>`)}
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
    const target = event.target as CheckboxElement;
    const context = this.grid.getEventContext(event) as GridEventContext<User>;
    const user = context.item;
    if (user) {
      if (target.checked) {
        // show user details
        this.detailsOpened = [...this.detailsOpened, user];
      } else if (this.detailsOpened.length) {
        // hide user details
        this.detailsOpened = this.detailsOpened.filter(
          (item) => item.name.first !== user.name.first
        );
      }
    }
  }
}

customElements.define('user-info', UserInfo);

const getCellContent = (cell: Element) => {
  return cell ? (cell.querySelector('slot') as HTMLSlotElement).assignedNodes()[0] : null;
};

const getRows = (container: Element) => {
  return container.querySelectorAll('tr');
};

const getRowCells = (row: HTMLElement) => {
  return Array.from(row.querySelectorAll('[part~="cell"]'));
};

const getContainerCellContent = (container: Element, row: number, col: number) => {
  return getCellContent(getContainerCell(container, row, col));
};

const getContainerCell = (container: Element, row: number, col: number) => {
  const rows = getRows(container);
  const cells = getRowCells(rows[row]);
  return cells[col];
};

const getBodyCellContent = (grid: GridElement, row: number, col: number) => {
  const container = grid.$.items;
  return getContainerCellContent(container, row, col) as HTMLElement;
};

const strip = (str: string): string => {
  // strip lit-html marker comments
  return str.replace(/<!--[^>]*-->/g, '');
};

describe('vaadin-grid renderer', () => {
  let wrapper: UserInfo;
  let grid: GridElement;

  beforeEach(async () => {
    wrapper = await fixture(`<user-info></user-info>`);
    grid = wrapper.renderRoot.querySelector('vaadin-grid') as GridElement;
  });

  it('should have valid content when renderer is set', () => {
    expect(strip(getBodyCellContent(grid, 0, 0).innerHTML)).to.eql('laura');
    expect(strip(getBodyCellContent(grid, 0, 1).innerHTML)).to.eql('arnaud');
  });

  it('should update content when passed property is changed', async () => {
    wrapper.filter = 'r';
    await wrapper.updateComplete;
    expect(strip(getBodyCellContent(grid, 0, 0).innerHTML)).to.eql('<b>laura</b>');
    expect(strip(getBodyCellContent(grid, 0, 1).innerHTML)).to.eql('<b>arnaud</b>');
  });

  it('should call render once when passed property is changed', async () => {
    const spy = sinon.spy(grid, 'render');
    wrapper.filter = 'r';
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(1);
  });

  it('should not re-render on unrelated property change', async () => {
    const spy = sinon.spy(grid, 'render');
    wrapper.detailsOpened = [wrapper.users[0]];
    await wrapper.updateComplete;
    expect(spy.callCount).to.equal(0);
  });

  it('should support using host methods as event listeners', async () => {
    const checkbox = grid.querySelector('vaadin-checkbox')!;
    checkbox.click();
    await wrapper.updateComplete;
    expect(wrapper.detailsOpened).to.deep.equal([wrapper.users[0]]);
  });

  it('should render valid row details content', async () => {
    wrapper.detailsOpened = [wrapper.users[0]];
    await wrapper.updateComplete;
    expect(strip(getBodyCellContent(grid, 0, 3).innerHTML)).to.eql('laura arnaud');
  });
});
