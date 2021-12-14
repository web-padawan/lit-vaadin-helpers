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

## Background

The following is taken as is from the [comment](https://github.com/web-padawan/lit-vaadin-helpers/issues/8#issuecomment-841079162) by [Legioth](https://github.com/Legioth) (ex-CTO, currently VP of Product Management).

---

Here's some background on the design issues that we're trying to balance between.

In any case, the renderer callback itself always follows this basic format (ignoring optional parameters)

```js
(item) => html`Value: ${item.value}`;
```

In the case of renderers that are used for teleporting elements outside the host element's stacking context, the `item` parameter is also omitted.

The two primary syntax options that we're considering are:

- Using a property: `<vaadin-select .renderer=${callback}>`
- Using a directive: `<vaadin-select ${renderer(callback)}>`

There are then also various considerations with naming, but we're trying to focus on the syntax first.

There are also some other variants that could be mentioned even though they are not adding any new aspects to the design space:

- Property with wrapper function: `<vaadin-select .renderer=${wrapperFunction(callback)}>`
- Directive as property value: `<vaadin-select .renderer=${wrapperDirective(callback)}>`
- Directive as element content: `<vaadin-select>${renderer(callback)}`

We have identified three primary aspects to take into account when trying to determine which of those alternatives would be better:

- Discoverability
- Library independence
- Control over re-rendering

### Discoverability

With a property, the IDE can read the TypeScript definitions to offer auto completion for the specific properties that a custom element supports. There is no similar concept for defining that a specific custom element has separate support for a specific directive.

From a semantic point of view, a directive should service the host template rather than serving the component that is defined in that template. That's why we wouldn't even want to suggest improved tooling for connecting a specific directive to a specific component.

### Library independence

We want the Vaadin components to be library agnostic, but at the same time optimized for use with Vaadin's recommended application tech stack that uses `LitElement` for view implementations.

From this perspective, it would be problematic to have a property with a callback that returns `TemplateResult` which is specific to Lit. We are currently in the middle of the messy business of removing Polymer `<template>` support from our components and we would like to avoid doing the same at some point in the future when something even better than Lit comes along.

A directive is a perfect fit here since it's detached from the API of the component itself while still making it possible to provide an opinionated shorthand syntax for the case we want to optimize for.

One considered alternative for using a property would be to also allow returning `null` and in that case the callback would instead have to directly manipulate a DOM element instance that is passed as an additional parameter that can typically be ignored when using Lit. It would thus be possible for someone not using Lit to use a Vaadin component in this way:

```js
someVaadinElement.renderer = (item, options) => options.renderRoot.textContent = `Value: ${item.value}`;
```

If go with a directive, then this type of `renderer` property would still exist and the directive would just be a shorthand for assigning its value.

### Control over re-rendering

Inlining an arrow function in the application's `render()` means that the value of a property changes for every render which is typically bad for performance if a new property value causes internals to be refreshed. Assign a reference to a separate function means that the value never changes which is problematic when the render callback isn't a pure function.

The `guard()` directive could be used in either situation, but designing for this approach comes at the expense of developer ergonomics:

- The simplest possible syntax with just an inline arrow function is never the right way
- Refactoring to extract or inline causes changes in behaviour
- There is an additional concept for the developer to master before they can use Vaadin components efficiently

Using a directive makes it possible to make `guard()` functionality a core part of the directive itself. `<vaadin-select ${renderer(callback)}>` would never trigger re-rendering of component internals from `render()`. To explicitly trigger re-rendering for some changed state, the developer would instead type `<vaadin-select ${renderer(callback, [this.stateUsedByCallback])}>`.

Something similar can also be done with a property as long as assigning a new value doesn't trigger internal re-render. We would then instead need a separate way of signalling when re-render is needed. We have so far only identified weird approaches:

- A separate property name that causes re-render for value changes, and requiring the application developer to use `guard()` in this situation: `<vaadin-select .eagerRenderer=${guard([this.stateUsedByCallback], callback)}>`
- A separate property for the dependencies: `<vaadin-select .renderer=${callback} .rendererDependencies=${[this.stateUsedByCallback]}>`
- Wrapping the renderer with something that signals that it's special: `<vaadin-select .renderer=${rendererGuard([this.stateUsedByCallback], callback)}>`. Note that it's not enough to use the regular `guard()` directive since the component itself needs to know whether it's there so that the default can still be to not re-render for new values when using the plain syntax.

This whole line of thought is based on the potentially dangerous assumption that it's a good idea to by default not eagerly re-render. This is maybe not obvious for developers since there wouldn't be anything special like an explicitly declared (potentially empty) `guard()` to show that something special is going on. A developer who observes that their inline arrow function gets invoked repeatedly might have a chance of understanding what goes on, whereas a developer might become terminally stuck in the opposite situation when they would want the renderer to be run again but they cannot figure out how to break out from the guarded default mode.
