
import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IBasket {
  items: HTMLElement[];
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

  set items(items: HTMLElement[]) {
    if (items.length === 0) {
      this.listContainer.innerHTML = "<p>Корзина пуста</p>";
    } else {
      this.listContainer.replaceChildren(...items);
    }
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }

  set disabled(value: boolean) {
    this.button.disabled = value;
  }
}