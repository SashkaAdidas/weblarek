import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";

export interface ICard {
  title: string;
  image?: string;
  price: number | null;
}

export class Card extends Component<ICard> {
  protected titleElement: HTMLElement;
  protected imageElement?: HTMLImageElement;
  protected priceElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container,
    );
    this.imageElement =
      this.container.querySelector<HTMLImageElement>(".card__image") ??
      undefined;
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container,
    );
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set image(value: string) {
    if (this.imageElement) {
      this.imageElement.src = value;
    }
  }

  set price(value: number | null) {
    if (value === null) {
      this.priceElement.textContent = "Недоступно";
    } else {
      this.priceElement.textContent = `${value} синапсов`;
    }
  }
  render(data: IProduct): HTMLElement {
    super.render(data);
    this.title = data.title;
    this.price = data.price;

    if (data.image) {
      this.image = data.image;
    }

    return this.container;
  }
}
