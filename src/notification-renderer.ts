import { nothing, ElementPart, render, RenderOptions, TemplateResult } from 'lit';
import { directive, DirectiveResult, PartInfo, PartType } from 'lit/directive.js';
import { NotificationElement } from '@vaadin/vaadin-notification';
import { AbstractRendererDirective } from './abstract-renderer.js';

export type NotificationLitRenderer = (notification: NotificationElement) => TemplateResult;

class NotificationRendererDirective extends AbstractRendererDirective<NotificationElement> {
  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) {
      throw new Error('Only supports binding to element');
    }
  }

  render(renderer: NotificationLitRenderer, _value?: unknown) {
    return renderer;
  }

  update(part: ElementPart, [renderer, value]: [NotificationLitRenderer, unknown]) {
    super.update(part, [renderer, value]);

    return nothing;
  }

  /**
   * Set renderer callback to the element.
   */
  addRenderer(
    element: NotificationElement,
    renderer: NotificationLitRenderer,
    value: unknown,
    options: RenderOptions
  ) {
    element.renderer = (root: HTMLElement, notification?: NotificationElement) => {
      if (notification) {
        render(this.render(renderer, value).call(options.host, notification), root, options);
      }
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
