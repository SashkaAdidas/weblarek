import "./scss/styles.scss";

import { Basket } from "./components/models/Basket";
import { Catalog } from "./components/models/Catalog";
import { OrderData } from "./components/models/OrderData";

import { API } from "./components/api/API";
import { Api } from "./components/base/Api";

import { API_URL } from "./utils/constants";
import { apiProducts } from "./utils/data";

import { EventEmitter } from "./components/base/Events";

// Компоненты View
import { Modal } from "./components/views/Modal";
import { CardCatalog } from "./components/views/CardCatalog";
import { CardPreview } from "./components/views/CardPreview";
import { BasketView } from "./components/views/BasketView";
import { OrderForm } from "./components/views/OrderForm";
import { Success } from "./components/views/Success";

// Шаблоны
const cardCatalogTemplate =
  document.querySelector<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate =
  document.querySelector<HTMLTemplateElement>("#card-preview");
const basketTemplate = document.querySelector<HTMLTemplateElement>("#basket");
const orderFormTemplate = document.querySelector<HTMLTemplateElement>("#order");
const contactsTemplate =
  document.querySelector<HTMLTemplateElement>("#contacts");
const successTemplate = document.querySelector<HTMLTemplateElement>("#success");

// Контейнеры
const gallery = document.querySelector<HTMLElement>(".gallery");
const modalContainer = document.querySelector<HTMLElement>("#modal-container");

if (!cardCatalogTemplate) throw new Error("Не найден шаблон #card-catalog");
if (!cardPreviewTemplate) throw new Error("Не найден шаблон #card-preview");
if (!basketTemplate) throw new Error("Не найден шаблон #basket");
if (!orderFormTemplate) throw new Error("Не найден шаблон #order");
if (!successTemplate) throw new Error("Не найден шаблон #success");
if (!gallery) throw new Error("Не найден .gallery");
if (!modalContainer) throw new Error("Не найден #modal-container");
if (!contactsTemplate) throw new Error("Не найден шаблон #contacts");

// Модели
const basket = new Basket();
const catalog = new Catalog();
const order = new OrderData();

// События
const events = new EventEmitter();

// API
const apiClient = new Api(API_URL);
const appApi = new API(apiClient);

// Типы
interface IProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number | null;
}

type TPayment = "cash" | "online";

// Представления
const modal = new Modal(modalContainer, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const successView = new Success(cloneTemplate(successTemplate), events);

// Отладка
(window as any).orderForm = orderForm;

// === УТИЛИТЫ ===
function cloneTemplate(template: HTMLTemplateElement): HTMLElement {
  const element = template.content.firstElementChild?.cloneNode(true);
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error(`Не удалось получить контент из шаблона: ${template.id}`);
  }
  return element;
}

function isInBasket(id: string): boolean {
  return basket.getItems().some((item) => item.id === id);
}

function setOrderField(field: string, value: string) {
  switch (field) {
    case "payment":
      order.setPayment(value as TPayment);
      break;
    case "address":
      order.setAddress(value);
      break;
    case "email":
      order.setEmail(value);
      break;
    case "phone":
      order.setPhone(value);
      break;
  }
}

// Валидация шага 1
function validateStep1(): string[] {
  const errors: string[] = [];
  if (!order.getPayment()) {
    errors.push("Не выбран способ оплаты");
  }
  if (!order.getAddress()) {
    errors.push("Не указан адрес доставки");
  }
  return errors;
}

// Валидация шага 2
function validateStep2(): string[] {
  const errors: string[] = [];
  if (!order.getEmail()) {
    errors.push("Требуется email");
  }
  if (!order.getPhone()) {
    errors.push("Требуется телефон");
  }
  return errors;
}

function renderProductsAsElements(items: IProduct[]): HTMLElement[] {
  return items.map((item) => {
    const cardElement = cloneTemplate(cardCatalogTemplate!);
    if (!cardElement || !(cardElement instanceof HTMLElement)) {
      throw new Error("Не удалось клонировать карточку товара");
    }
    const card = new CardCatalog(cardElement, {
      onClick: () => events.emit("product:select", item),
    });
    card.render(item);
    return cardElement;
  });
}

function isBasketEmpty(): boolean {
  return basket.getItems().length === 0;
}

let currentStep = 1;

// === ЛОГИКА ===

// Загрузка товаров
appApi
  .getProducts()
  .then((items) => {
    catalog.setItems(items);
    events.emit("items:loaded");
  })
  .catch((err) => {
    console.error("Товары не удалось загрузить", err);
    if (catalog.getItems().length === 0) {
      console.warn("API не ответил, используем тестовые данные");
      catalog.setItems(apiProducts.items);
      events.emit("items:loaded");
    }
  });

events.on("items:loaded", () => {
  gallery.replaceChildren(...renderProductsAsElements(catalog.getItems()));
});

events.on("product:select", (item: IProduct) => {
  const cardElement = cloneTemplate(cardPreviewTemplate);
  const card = new CardPreview(cardElement, {
    onBuy: (item) => {
      if (isInBasket(item.id)) {
        basket.remove(item.id);
      } else {
        basket.add(item);
      }
      events.emit("basket:changed");
      modal.close();
    },
  });
  card.render(item);
  card.updateButton(isInBasket(item.id), item.price);
  modal.render({ content: cardElement });
});

events.on("basket:changed", () => {
  const counter = document.querySelector(".header__basket-counter");
  if (counter) {
    counter.textContent = String(basket.getTotalCount());
  }
  basketView.render({
    items: basket.getItems(),
    total: basket.getTotal(),
    disabled: isBasketEmpty(),
  });
});

events.on("basket:open", () => {
  modal.render({ content: basketView.render() });
});

events.on("basket:remove", ({ id }: { id: string }) => {
  basket.remove(id);
  events.emit("basket:changed");
});

events.on("basket:order", () => {
  modal.render({ content: orderForm.render() });
  const errors1 = validateStep1();
  orderForm.valid = errors1.length === 0;
});

events.on(
  "form:change",
  ({ field, value }: { field: string; value: string }) => {
    setOrderField(field, value);
    const errors = currentStep === 1 ? validateStep1() : validateStep2();
    orderForm.valid = errors.length === 0;
  },
);

events.on("order:submit", () => {
  if (currentStep === 1) {
    const errors1 = validateStep1();
    if (errors1.length === 0) {
      currentStep = 2;

      const contactsElement = cloneTemplate(contactsTemplate);
      const contactsForm = new OrderForm(contactsElement, events);

      contactsForm.email = order.getEmail();
      contactsForm.phone = order.getPhone();

      modal.render({ content: contactsForm.render() });

      // --- КЛЮЧЕВАЯ ЧАСТЬ: валидация при старте ---
      const validateAndSync = () => {
        const errors = validateStep2();
        contactsForm.valid = errors.length === 0; // ← это делает кнопку disabled

        if (errors.includes("Требуется email")) {
        } else {
          contactsForm.hideEmailError();
        }
      };

      // Запускаем валидацию сразу после рендера
      validateAndSync();

      // Слушаем ввод
      contactsElement.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        if (target === contactsForm.emailField) {
          order.setEmail(target.value);
        } else if (target === contactsForm.phoneField) {
          order.setPhone(target.value);
        }
        validateAndSync(); // перепроверяем
      });

      // Обработка клика по кнопке
      contactsElement.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const submitButton = contactsElement.querySelector(
          ".button:not(.button_alt):not([name])",
        );
        if (submitButton && target.closest(".button") === submitButton) {
          e.preventDefault();
          events.emit("order:submit");
        }
      });
    }
  } else {
    // Шаг 2: окончательная проверка
    const errors2 = validateStep2();
    if (errors2.length > 0) {
      return;
    }

    appApi
      .postOrder({
        payment: order.getPayment() || "cash",
        email: order.getEmail(),
        phone: order.getPhone(),
        address: order.getAddress(),
        total: basket.getTotal(),
        items: basket.getItems().map((i) => i.id),
      })
      .then((result) => {
        basket.clear();
        modal.render({
          content: successView.render({ total: result.total }),
        });
      })
      .catch((err) => {
        console.error("Ошибка при отправке заказа:", err);
      });
  }
});

// МОДАЛ CLOUS
events.on("modal:close", () => {
  currentStep = 1;
  orderForm.gotoFirstStep();
  orderForm.hideEmailError();
});

// Открытие корзины по клику
const basketButton = document.querySelector(".header__basket");
if (!basketButton) throw new Error("Не найдена кнопка корзины .header__basket");
basketButton.addEventListener("click", () => {
  events.emit("basket:open");
});

// Инициализация
events.emit("basket:changed");
