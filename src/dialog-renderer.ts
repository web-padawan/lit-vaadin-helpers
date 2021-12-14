import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { Dialog } from '@vaadin/dialog';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type DialogLitRenderer = (dialog: Dialog) => TemplateResult;

class DialogRendererDirective extends AbstractRendererDirective<Dialog, DialogLitRenderer> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: Dialog, renderer: DialogLitRenderer, options: RenderOptions) {
    element.renderer = (root: HTMLElement, dialog?: Dialog) => {
      render(renderer.call(options.host, dialog as Dialog), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: Dialog) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(DialogRendererDirective);

export const dialogRenderer = (
  renderer: DialogLitRenderer,
  value?: unknown
): DirectiveResult<typeof DialogRendererDirective> => rendererDirective(renderer, value);
