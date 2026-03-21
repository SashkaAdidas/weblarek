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
  protected submitButton: HTMLButtonElement;

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

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit("order:submit");
    });

    this.addressInput.addEventListener("input", () => {
      this.events.emit("form:change", {
        field: "address",
        value: this.addressInput.value,
      });
    });

    this.paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.events.emit("form:change", {
          field: "payment",
          value: button.name,
        });
      });
    });
  }

  set payment(value: string | null) {
    this.paymentButtons.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === value);
    });
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  set errors(value: string[]) {
    this.errorsElement.textContent = value.join(", ");
    this.valid = value.length === 0;
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }
}
