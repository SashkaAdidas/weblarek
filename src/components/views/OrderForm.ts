import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IOrderForm {
  payment: string;
  address: string;
  email: string;
  phone: string;
}

export class OrderForm extends Component<IOrderForm> {
  protected paymentButtons: HTMLButtonElement[] = [];
  protected addressInput: HTMLInputElement | null = null;
  protected emailInput: HTMLInputElement | null = null;
  protected phoneInput: HTMLInputElement | null = null;
  protected button: HTMLButtonElement;

  protected firstStep: HTMLElement | null = null;
  protected secondStep: HTMLElement | null = null;
  protected emailError: HTMLElement | null = null;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.firstStep = container.querySelector<HTMLElement>(".order") || null;
    this.secondStep =
      container.querySelector<HTMLElement>(".order-email") || null;

    if (this.firstStep) {
      this.paymentButtons = Array.from(
        this.firstStep.querySelectorAll<HTMLButtonElement>(".button_alt[name]"),
      );
    }

    this.addressInput =
      container.querySelector('input[name="address"]') ||
      container.querySelector('.form__input[name="address"]') ||
      null;

    this.emailInput =
      container.querySelector('input[name="email"]') ||
      container.querySelector('input[type="email"]') ||
      container.querySelector('[placeholder*="email"]') ||
      container.querySelector(".email-input") ||
      null;

    this.phoneInput =
      container.querySelector('input[name="phone"]') ||
      container.querySelector('input[type="tel"]') ||
      container.querySelector('[placeholder*="телефон"]') ||
      container.querySelector('[placeholder*="phone"]') ||
      container.querySelector(".phone-input") ||
      null;

    this.button = ensureElement<HTMLButtonElement>(
      ".button:not(.button_alt):not([name])",
      this.container,
    );

    if (!this.button) {
      throw new Error("Не найдена кнопка формы.");
    }

    // Способ оплаты
    this.paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.paymentButtons.forEach((b) =>
          b.classList.remove("button_alt-active"),
        );
        btn.classList.add("button_alt-active");
        this.events.emit("form:change", { field: "payment", value: btn.name });
      });
    });

    // Адрес
    if (this.addressInput) {
      this.addressInput.addEventListener("input", () => {
        this.events.emit("form:change", {
          field: "address",
          value: this.addressInput?.value || "",
        });
      });
    }

    // Email
    if (this.emailInput) {
      this.emailInput.addEventListener("input", () => {
        this.events.emit("form:change", {
          field: "email",
          value: this.emailInput?.value || "",
        });
      });
    }

    // Phone
    if (this.phoneInput) {
      this.phoneInput.addEventListener("input", () => {
        this.events.emit("form:change", {
          field: "phone",
          value: this.phoneInput?.value || "",
        });
      });
    }

    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.events.emit("order:submit");
    });
  }

  gotoFirstStep() {
    if (this.firstStep) this.firstStep.style.display = "";
    if (this.secondStep) this.secondStep.style.display = "none";
    this.button.textContent = "Далее";
    this.button.disabled = false;
  }

  gotoSecondStep() {
    if (this.firstStep) this.firstStep.style.display = "none";
    if (this.secondStep) this.secondStep.style.display = "";
    this.button.textContent = "Оплатить";
    this.button.disabled = false;
  }

  set payment(value: string) {
    this.paymentButtons.forEach((btn) => {
      const isActive =
        (value === "online" && btn.name === "card") ||
        (value === "cash" && btn.name === "cash");
      btn.classList.toggle("button_alt-active", isActive);
    });
  }

  set address(value: string) {
    if (this.addressInput) this.addressInput.value = value;
  }

  set email(value: string) {
    if (this.emailInput) this.emailInput.value = value;
  }

  set phone(value: string) {
    if (this.phoneInput) this.phoneInput.value = value;
  }

  set valid(value: boolean) {
    this.button.disabled = !value;
    if (value) {
      this.button.removeAttribute("disabled");
    } else {
      this.button.setAttribute("disabled", "disabled");
    }
  }

  //работа с ошибками

  showEmailError(message: string) {
    if (!this.emailInput) return;
    this.hideEmailError(); // очистим старую

    this.emailError = document.createElement("span");
    this.emailError.className = "form__error";
    this.emailError.style.color = "#ff0000";
    this.emailError.style.fontSize = "12px";
    this.emailError.style.marginTop = "4px";
    this.emailError.style.display = "block";
    this.emailError.textContent = message;

    const parent = this.emailInput.parentNode;
    if (parent) {
      parent.insertBefore(this.emailError, this.emailInput.nextSibling);
    }
  }

  hideEmailError() {
    if (this.emailError && this.emailError.parentNode) {
      this.emailError.parentNode.removeChild(this.emailError);
    }
    this.emailError = null;
  }

  get emailField(): HTMLInputElement | null {
    return this.emailInput;
  }

  get phoneField(): HTMLInputElement | null {
    return this.phoneInput;
  }

  get secondStepView(): HTMLElement | null {
    return this.secondStep;
  }
}
