import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

interface IOrderFormState {
  address: string;
  payment: string;
}

export class OrderForm extends Form<IOrderFormState> {
  protected addressInput: HTMLInputElement;
  protected paymentButtons: HTMLButtonElement[];
  protected errorsElement: HTMLElement;
  protected _payment: string | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.addressInput = ensureElement<HTMLInputElement>(
      "input[name=address]",
      this.container,
    );
    this.paymentButtons = Array.from(
      this.container.querySelectorAll<HTMLButtonElement>(".button_alt"),
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container,
    );
    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container,
    );

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

  set payment(value: string | null) {
    this._payment = value;
    this.selectPayment(value);
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  selectPayment(method: string | null) {
    this.paymentButtons.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === method);
    });
  }

  clear() {
    this.addressInput.value = "";
    this.paymentButtons.forEach((btn) =>
      btn.classList.remove("button_alt-active"),
    );
    this.errors = [];
    this.valid = false;
  }
  set errors(value: string[]) {
    this.errorsElement.textContent = value.join(", ");
  }
  set valid(value: boolean) {
    if (this.submitButton) {
      this.submitButton.disabled = !value;
    }
  }
}
