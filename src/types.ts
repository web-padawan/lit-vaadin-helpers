import { TemplateResult } from 'lit';

export type Renderer = () => TemplateResult;

export interface GridModel<T> {
  index: number;
  item: T;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  detailsOpened?: boolean;
}
