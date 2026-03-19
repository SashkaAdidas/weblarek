import { Component } from "../base/Component";

export class Gallery extends Component<HTMLElement[]> {
  constructor(container: HTMLElement) {
    super(container);
  }

  render(items: HTMLElement[]): HTMLElement {
    this.container.replaceChildren(...items);
    return this.container;
  }
}
