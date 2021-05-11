# lit-vaadin-helpers

Helpers for using [Vaadin web components](https://github.com/vaadin/web-components) with [Lit 2](https://lit.dev).

## Installation

```sh
npm install lit-vaadin-helpers
```

Note: this library is compatible Vaadin components [21.0.0-alpha1](https://github.com/vaadin/web-components/releases/tag/v21.0.0-alpha1) and above.

## Usage

```js
import { html, LitElement } from 'lit';
import '@vaadin/vaadin-select';
import '@vaadin/vaadin-list-box';
import '@vaadin/vaadin-item';
import { selectRenderer } from 'lit-vaadin-helpers';

class DialogDemo extends LitElement {
  render() {
    return html`
      <vaadin-select
        ${selectRenderer(
          () => html`
            <vaadin-list-box>
              <vaadin-item>Option 1</vaadin-item>
              <vaadin-item>Option 2</vaadin-item>
              <vaadin-item>Option 3</vaadin-item>
            </vaadin-list-box>
          `
        )}
      ></vaadin-select>
    `;
  }
}
```

See [demo folder](https://github.com/web-padawan/lit-vaadin-helpers/tree/master/src/demo) for more examples.

## Contributing

### Install dependencies

```sh
npm install
```

### Run build

```sh
npm run build
```

### Run demo

```sh
npm run dev
```

### Run unit tets

```sh
npm test
```
