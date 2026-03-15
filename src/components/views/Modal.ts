import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected modalContainer: HTMLElement;
  protected closeButton: HTMLButtonElement;
  private isOpen = false; // Для защиты от повторного открытия

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    // Ищем контейнер и кнопку закрытия
    this.modalContainer = ensureElement<HTMLElement>(
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
    this.closeButton.addEventListener("click", () => {
      this.close();
    });

    // Подписываемся на внешнее событие закрытия
    events.on("modal:close", () => {
      this.close();
    });
  }

  // Устанавливаем контент внутрь модального окна
  set content(value: HTMLElement) {
    this.modalContainer.replaceChildren(value);
  }

  // Открываем модалку
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add("modal_active");
    document.body.style.overflow = "hidden";
    this.events.emit("modal:open");
  }

  // Закрываем модалку
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove("modal_active");
    document.body.style.overflow = "";
    this.events.emit("modal:close"); // Событие для других компонентов
  }

  // Рендерим и открываем модалку
  render(data: IModal): HTMLElement {
    this.content = data.content;
    this.open();
    return this.container;
  }
}
