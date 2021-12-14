# lit-vaadin-helpers

Helpers for using [Vaadin web components](https://github.com/vaadin/web-components) with [Lit 2](https://lit.dev).

## Installation

```sh
npm install lit-vaadin-helpers
```

Note: the latest `0.3.0` version is compatible with Vaadin components [22.0.0](https://github.com/vaadin/web-components/releases/tag/v22.0.0) and above.

If you are using Vaadin components 21.0.x, please use `0.2.2` version:

```sh
npm install lit-vaadin-helpers@0.2.2
```

## Usage

```js
import { html, LitElement } from 'lit';
import '@vaadin/item';
import '@vaadin/list-box';
import '@vaadin/select';
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
