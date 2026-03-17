import { Form } from "./Form";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IFormContactsData {
  email: string;
  phone: string;
}

export class FormContacts extends Form<IFormContactsData> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.emailInput = ensureElement<HTMLInputElement>(
      "input[name='email']",
      this.container,
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      "input[name='phone']",
      this.container,
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container,
    );
    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container,
    );

    // Слушаю изменения полей
    [this.emailInput, this.phoneInput].forEach((input) => {
      input.addEventListener("input", () => {
        this.events.emit("contacts:change", {
          field: input.name,
          value: input.value,
        });
      });
    });
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }
  set errors(value: string[]) {
    this.errorsElement.textContent = value.join(", ");
  }
}
