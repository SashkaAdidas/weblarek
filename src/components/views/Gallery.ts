import { Component } from "../base/Component";
import { IProduct } from "../../types";
import { CardCatalog } from "./CardCatalog";
import { cloneTemplate } from "../../utils/utils";
import { cardCatalogTemplate } from "../../main";
import { IEvents } from "../base/Events";

export class Gallery extends Component<HTMLElement[]> {
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
  }

  render(items: HTMLElement[]): HTMLElement {
    this.container.replaceChildren(...items);
    return this.container;
  }

  renderProductsAsElements(items: IProduct[]): HTMLElement[] {
    return items.map((item) => {
      const cardElement = cloneTemplate(cardCatalogTemplate!);
      const card = new CardCatalog(cardElement, {
        onClick: () => this.events.emit("product:select", item),
      });
      card.render(item);
      return cardElement;
    });
  }
}
