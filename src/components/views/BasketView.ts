import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

interface IBasket {
  items: IProduct[];
  total: number;
  disabled: boolean;
}

export class BasketView extends Component<IBasket> {
  protected listContainer: HTMLElement;
  protected totalElement: HTMLElement;
  protected button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.listContainer = ensureElement<HTMLElement>(
      ".basket__list",
      this.container,
    );
    this.totalElement = ensureElement<HTMLElement>(
      ".basket__price",
      this.container,
    );
    this.button = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container,
    );

    this.button.addEventListener("click", () => {
      this.events.emit("basket:order");
    });
  }

  set items(items: IProduct[]) {
    if (items.length === 0) {
      this.listContainer.innerHTML = "<p>Корзина пуста</p>";
    } else {
      this.listContainer.innerHTML = "";

      items.forEach((item, itemIndex) => {
        const cardElement = document.createElement("li");
        cardElement.className = "basket__item";

        const numberBadge = document.createElement("span");
        numberBadge.className = "basket__item-index";
        numberBadge.style.backgroundColor = "black";
        numberBadge.textContent = (itemIndex + 1).toString();

        cardElement.style.display = "flex";
        cardElement.style.justifyContent = "space-between";
        cardElement.style.alignItems = "center";
        cardElement.style.width = "100%";

        const title = document.createElement("span");
        title.className = "card__title";
        title.textContent = item.title;
        title.style.marginRight = "auto";

        const price = document.createElement("span");
        price.className = "basket__item-price";
        price.textContent = `${item.price ?? 0} синапсов`;

        const removeBtn = document.createElement("button");
        removeBtn.className = "basket__item-delete";
        removeBtn.setAttribute("aria-label", "удалить");
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.events.emit("basket:remove", { id: item.id });
        });

        cardElement.append(numberBadge, title, price, removeBtn);
        this.listContainer.appendChild(cardElement);
      });
    }

    this.total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    this.disabled = items.length === 0;
  }
  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }

  set disabled(value: boolean) {
    this.button.disabled = value;
  }
}
