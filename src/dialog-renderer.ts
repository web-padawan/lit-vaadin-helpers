import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { DialogElement } from '@vaadin/vaadin-dialog';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type DialogLitRenderer = (dialog: DialogElement) => TemplateResult;

class DialogRendererDirective extends AbstractRendererDirective<DialogElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: DialogLitRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [DialogLitRenderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: DialogElement,
    renderer: DialogLitRenderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement, dialog?: DialogElement) => {
      render(this.render(renderer, value)(dialog as DialogElement), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: DialogElement) {
    element.render();
  }
}

const rendererDirective = directive(DialogRendererDirective);

export const dialogRenderer = (
  renderer: DialogLitRenderer,
  value?: unknown
): DirectiveResult<typeof DialogRendererDirective> => rendererDirective(renderer, value);
