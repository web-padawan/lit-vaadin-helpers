import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { NotificationElement } from '@vaadin/vaadin-notification';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type NotificationLitRenderer = (notification: NotificationElement) => TemplateResult;

class NotificationRendererDirective extends AbstractRendererDirective<
  NotificationElement,
  NotificationLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: NotificationElement,
    renderer: NotificationLitRenderer,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement, notification?: NotificationElement) => {
      render(renderer.call(options.host, notification as NotificationElement), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: NotificationElement) {
    element.render();
  }
}

const rendererDirective = directive(NotificationRendererDirective);

export const notificationRenderer = (
  renderer: NotificationLitRenderer,
  value?: unknown
): DirectiveResult<typeof NotificationRendererDirective> => rendererDirective(renderer, value);
