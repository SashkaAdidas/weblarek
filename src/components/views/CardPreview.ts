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
  private categoryElement: HTMLElement | null = null;

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
    this.categoryElement =
      container.querySelector<HTMLElement>(".card__category");

    this.button.addEventListener("click", () => {
      if (this.itemData && !this.button.disabled) {
        this.actions.onBuy(this.itemData);
      }
    });
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  //  set category
  set category(value: string) {
    if (this.categoryElement) {
      const element = this.categoryElement;
      element.textContent = value;

      // Удаляем старые классы
      Array.from(element.classList).forEach((cls) => {
        if (cls.startsWith("card__category_")) {
          element.classList.remove(cls);
        }
      });

      // Маппинг
      const categoryMap: Record<string, string> = {
        "софт-скил": "soft",
        "хард-скил": "hard",
        дополнительное: "additional",
        кнопка: "button",
        другое: "other",
      };

      const cssClass = categoryMap[value] || "other";
      element.classList.add(`card__category_${cssClass}`);
    }
  }

  render(item: IProduct): HTMLElement {
    this.itemData = item;
    super.render(item);
    this.description = item.description;
    this.category = item.category;
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
