import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected modalContent: HTMLElement;
  protected closeButton: HTMLButtonElement;
  private isOpen = false;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.modalContent = ensureElement<HTMLElement>(
      ".modal__container",
      this.container,
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container,
    );

    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    this.closeButton.addEventListener("click", () => {
      this.close();
    });
  }

  set content(value: HTMLElement) {
    this.modalContent.replaceChildren();
    this.modalContent.appendChild(this.closeButton);
    this.modalContent.appendChild(value);
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add("modal_active");
    document.body.style.overflow = "";
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove("modal_active");
  }

  render(data: IModal): HTMLElement {
    this.content = data.content;
    this.open();
    return this.container;
  }
}