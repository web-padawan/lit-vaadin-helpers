import { render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult } from 'lit/directive.js';
import { Notification } from '@vaadin/notification';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type NotificationLitRenderer = (notification: Notification) => TemplateResult;

class NotificationRendererDirective extends AbstractRendererDirective<
  Notification,
  NotificationLitRenderer
> {
  /**
   * Set renderer callback to the element.
   */
  addRenderer(element: Notification, renderer: NotificationLitRenderer, options: RenderOptions) {
    element.renderer = (root: HTMLElement, notification?: Notification) => {
      render(renderer.call(options.host, notification as Notification), root, options);
    };
  }

  /**
   * Run renderer callback on the element.
   */
  runRenderer(element: Notification) {
    element.requestContentUpdate();
  }
}

const rendererDirective = directive(NotificationRendererDirective);

export const notificationRenderer = (
  renderer: NotificationLitRenderer,
  value?: unknown
): DirectiveResult<typeof NotificationRendererDirective> => rendererDirective(renderer, value);
