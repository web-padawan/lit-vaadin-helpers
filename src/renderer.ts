import {
  directive,
  Directive,
  noChange,
  PartInfo,
  PropertyPart,
  PROPERTY_PART,
  render,
  TemplateResult
} from 'lit-html';

interface HasRenderer {
  render(): void;
}

// A sentinel that indicates renderer() hasn't been initialized
const initialValue = {};
class RendererDirective extends Directive {
  previousValue: unknown = initialValue;

  constructor(part: PartInfo) {
    super();
    if (part.type !== PROPERTY_PART || part.name !== 'renderer') {
      throw new Error('Only supports binding to renderer property');
    }
  }

  render(_value: unknown, renderer: () => TemplateResult) {
    return renderer();
  }

  update(part: PropertyPart, [value, renderer]: Parameters<this['render']>) {
    const element = part.element as HTMLElement;

    if (Array.isArray(value)) {
      // Dirty-check arrays by item
      if (
        Array.isArray(this.previousValue) &&
        this.previousValue.length === value.length &&
        value.every((v, i) => v === (this.previousValue as Array<unknown>)[i])
      ) {
        return noChange;
      }
    } else if (this.previousValue === value) {
      // Dirty-check non-arrays by identity
      return noChange;
    }

    const firstRender = this.previousValue === initialValue;

    // Copy the value if it's an array so that if it's mutated we don't forget
    // what the previous values were.
    this.previousValue = Array.isArray(value) ? Array.from(value) : value;

    if (firstRender) {
      const host = (element.getRootNode() as ShadowRoot).host;

      return (root: HTMLElement) => {
        render(this.render(value, renderer), root, { eventContext: host });
      };
    } else {
      (element as HTMLElement & HasRenderer).render();
      return noChange;
    }
  }
}

export const renderer = directive(RendererDirective);
