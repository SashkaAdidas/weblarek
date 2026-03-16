import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";

interface ICardActions {
  onBuy: (item: IProduct) => void;
}

export class CardPreview extends Card {
  protected descriptionElement: HTMLElement;
  protected button: HTMLButtonElement;
  private itemData: IProduct | null = null;

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

    this.button.addEventListener("click", () => {
      if (this.itemData && !this.button.disabled) {
        this.actions.onBuy(this.itemData);
      }
    });
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  render(item: IProduct): HTMLElement {
    this.itemData = item;
    super.render(item);
    this.description = item.description;
    return this.container;
  }

  updateButton(isInBasket: boolean, price: number | null) {
    if (price === null) {
      this.button.textContent = "Недоступно";
      this.button.disabled = true;
    } else if (isInBasket) {
      this.button.textContent = "Удалить из корзины";
      this.button.disabled = false;
    } else {
      this.button.textContent = "Купить";
      this.button.disabled = false;
    }
  }
}
