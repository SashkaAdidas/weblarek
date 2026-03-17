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

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    // Ищю контейнер и кнопку закрытия
    this.modalContent = ensureElement<HTMLElement>(
      ".modal__container",
      this.container,
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container,
    );

    // Закрытие по клику на оверлее
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Закрытие по крестику
    this.closeButton.addEventListener("click", (e) => {
      this.close();
    });

    // Подписываемся на внешнее событие закрытия
    events.on("modal:close", () => {
      this.close();
    });
  }

  // Устанавливаю контент внутрь модального окна
  set content(value: HTMLElement) {
    this.modalContent.replaceChildren();
    this.modalContent.appendChild(this.closeButton);
    this.modalContent.appendChild(value);
  }

  // Открываю модалку
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add("modal_active");
    document.body.style.overflow = "hidden";
    this.events.emit("modal:open");
  }

  // Закрываю модалку
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove("modal_active");
    document.body.style.overflow = "";
    this.events.emit("modal:close");
  }

  // Рендерю и открываю модалку
  render(data: IModal): HTMLElement {
    this.content = data.content;
    this.open();
    return this.container;
  }
}
