import { directive, Part, NodePart, TemplateResult } from 'lit-html';

const rendererCache = new WeakMap();
const previousValues = new WeakMap();

interface ComponentWithRenderer {
  renderer?: (root: HTMLElement) => void;
}

export const renderer = directive((value: unknown, f: () => TemplateResult) => (part: Part) => {
  if (!(part instanceof NodePart)) {
    throw new Error('renderer can only be used in text bindings');
  }

  // NOTE: code below is copied from the "guard" directive.
  // https://github.com/Polymer/lit-html/blob/master/src/directives/guard.ts
  const previousValue = previousValues.get(part);

  if (Array.isArray(value)) {
    // Dirty-check arrays by item
    if (
      Array.isArray(previousValue) &&
      previousValue.length === value.length &&
      value.every((v, i) => v === previousValue[i])
    ) {
      return;
    }
  } else if (previousValue === value && (value !== undefined || previousValues.has(part))) {
    // Dirty-check non-arrays by identity
    return;
  }

  // Copy the value if it's an array so that if it's mutated we don't forget
  // what the previous values were.
  previousValues.set(part, Array.isArray(value) ? Array.from(value) : value);

  const cache = rendererCache.get(part);

  if (cache === undefined) {
    const parent = (part.startNode.parentNode as unknown) as ComponentWithRenderer;

    if (parent) {
      const newPart = new NodePart(part.options);

      parent.renderer = (root: HTMLElement) => {
        if (!root.firstChild) {
          newPart.appendInto(root);
        }
        newPart.setValue(f());
        newPart.commit();
      };

      rendererCache.set(part, { parent });
    }
  } else {
    const { parent } = cache;
    parent.render();
  }
});
