import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IFormState {
  valid: boolean;
  errors: string[];
}

export abstract class Form<T> extends Component<IFormState> {
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>(
      "button[type=submit]",
      this.container
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.onSubmit();
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(errors: string[]) {
    if (errors.length > 0) {
      this.errorsElement.textContent = errors.join("; ");
    } else {
      this.errorsElement.textContent = "";
    }
  }

  protected onSubmit(): void {
    this.events.emit("form:submit", {});
  }

  render(state?: Partial<IFormState>): HTMLElement {
    super.render(state);
    return this.container;
  }
}