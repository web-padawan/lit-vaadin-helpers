import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { DialogElement } from '@vaadin/vaadin-dialog';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type DialogLitRenderer = (dialog: DialogElement) => TemplateResult;

class DialogRendererDirective extends AbstractRendererDirective<DialogElement, DialogLitRenderer> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: DialogElement, renderer: DialogLitRenderer, options: RenderOptions) {
    element.renderer = (root: HTMLElement, dialog?: DialogElement) => {
      render(renderer.call(options.host, dialog as DialogElement), root, options);
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
