import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface ISuccess {
  total: number;
}
export class Success extends Component<ISuccess> {
  protected totalElement: HTMLElement;
  protected button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.totalElement = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container,
    );
    this.button = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container,
    );

    // Закрытие по кнопке
    this.button.addEventListener("click", () => {
      this.events.emit("modal:close");
    });
  }

  set total(value: number) {
    this.totalElement.textContent = `Списано ${value} синапсов`;
  }
}
