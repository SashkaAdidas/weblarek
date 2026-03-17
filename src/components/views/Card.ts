import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { categoryMap } from "../../utils/constants";

export interface ICard {
  title: string;
  image?: string;
  price: number | null;
}

export class Card extends Component<ICard> {
  protected titleElement: HTMLElement;
  protected imageElement?: HTMLImageElement;
  protected priceElement: HTMLElement;
  protected categoryElement?: HTMLElement | null = null;

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
    // Ищю элемент категории, если есть
    this.categoryElement =
      this.container.querySelector<HTMLElement>(".card__category");
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

  // Новый сеттер: устанавливает категорию и применяет CSS-класс
  set category(value: string) {
    if (this.categoryElement) {
      this.categoryElement.textContent = value;

      // Удаляю все возможные классы категорий
      Object.values(categoryMap).forEach((cls) => {
        const className = cls.split(".").pop();
        if (className) {
          this.categoryElement?.classList.remove(className);
        }
      });

      // Проверяю, есть ли такой ключ в объекте
      const cssClass =
        value in categoryMap
          ? categoryMap[value as keyof typeof categoryMap]
          : categoryMap["другое"];
      const className = cssClass.split(".").pop();

      if (className) {
        this.categoryElement.classList.add(className);
      }
    }
  }

  render(data: IProduct): HTMLElement {
    super.render(data);
    this.title = data.title;
    this.price = data.price;

    if (data.image) {
      this.image = data.image;
    }

    if (data.category && this.categoryElement) {
      this.category = data.category;
    }

    return this.container;
  }
}
