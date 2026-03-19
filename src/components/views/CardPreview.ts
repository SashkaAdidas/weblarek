import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";

interface ICardActions {
  onBuy: (item: IProduct) => void;
}

export class CardPreview extends Card {
  protected descriptionElement: HTMLElement;
  protected button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected actions: ICardActions,
  ) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container,
    );
    this.button = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container,
    );
  }

  set buttonText(value: string) {
    this.button.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.button.disabled = value;
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  render(item: IProduct): HTMLElement {
    super.render(item);
    this.description = item.description;
    this.button.onclick = () => {
      this.actions.onBuy(item);
    };

    return this.container;
  }
}
