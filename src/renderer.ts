import { directive, DirectiveFn, render, Part, PropertyPart, TemplateResult } from 'lit-html';

const partToRenderer = new WeakMap();
const previousValues = new WeakMap();

export const renderer = directive(
  (value: unknown, f: () => TemplateResult): DirectiveFn => async (part: Part) => {
    if (!(part instanceof PropertyPart) || part.committer.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }

    const cached = partToRenderer.get(part);
    const element = part.committer.element;

    if (!cached) {
      if (!element.isConnected) {
        await Promise.resolve();
      }

      const host = (element.getRootNode() as ShadowRoot).host as HTMLElement;

      part.setValue((root: HTMLElement) => {
        render(f(), root, { eventContext: host });
      });
      part.commit();
      partToRenderer.set(part, { element });
    } else {
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

      cached.element.render();
    }

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    previousValues.set(part, Array.isArray(value) ? Array.from(value) : value);
  }
);
