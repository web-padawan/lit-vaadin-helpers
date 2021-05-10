import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { SelectElement } from '@vaadin/vaadin-select';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type SelectLitRenderer = (select: SelectElement) => TemplateResult;

class SelectRendererDirective extends AbstractRendererDirective<SelectElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: SelectLitRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [SelectLitRenderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: SelectElement,
    renderer: SelectLitRenderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement, select?: SelectElement) => {
      if (select) {
        render(this.render(renderer, value)(select), root, options);
      }
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: SelectElement) {
    element.render();
  }
}

const rendererDirective = directive(SelectRendererDirective);

export const selectRenderer = (
  renderer: SelectLitRenderer,
  value?: unknown
): DirectiveResult<typeof SelectRendererDirective> => rendererDirective(renderer, value);
