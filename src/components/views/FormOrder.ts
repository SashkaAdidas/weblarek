import { Form } from "./Form";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IFormOrderData {
  address: string;
  payment: string;
}

export class FormOrder extends Form<IFormOrderData> {
  protected addressInput: HTMLInputElement;
  protected paymentButtons: NodeListOf<HTMLButtonElement>;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.addressInput = ensureElement<HTMLInputElement>(
      "input[name='address']",
      this.container,
    );
    this.paymentButtons =
      this.container.querySelectorAll<HTMLButtonElement>(".button_alt");

    // Слушаем изменения адреса
    this.addressInput.addEventListener("input", () => {
      this.events.emit("order:addressChange", {
        value: this.addressInput.value,
      });
    });

    // Слушаем выбор способа оплаты
    this.paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.paymentButtons.forEach((btn) =>
          btn.classList.remove("button_alt-active"),
        );
        button.classList.add("button_alt-active");
        this.events.emit("order:paymentChange", { value: button.name });
      });
    });
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  selectPayment(method: string) {
    this.paymentButtons.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === method);
    });
  }
}
