import { Card } from "./Card";
//import { IProduct as ICard } from "../../types";

interface ICardActions {
  onClick: () => void;
}

export class CardCatalog extends Card {
  protected categoryElement: HTMLElement | null = null;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.categoryElement =
      container.querySelector<HTMLElement>(".card__category");

    if (actions?.onClick) {
      this.container.addEventListener("click", (e) => {
        e.preventDefault();
        actions.onClick();
      });
    }
  }

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

      // Маппинг кириллицы → английские классы
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
}
