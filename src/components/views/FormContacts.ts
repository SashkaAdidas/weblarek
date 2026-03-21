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
  protected submitButton: HTMLButtonElement;

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

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit("contacts:submit");
    });

    [this.emailInput, this.phoneInput].forEach((input) => {
      input.addEventListener("input", () => {
        this.events.emit("form:change", {
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
    this.valid = value.length === 0;
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }
}
