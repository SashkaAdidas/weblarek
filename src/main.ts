import "./scss/styles.scss";

import { Basket } from "./components/models/Basket";
import { Catalog } from "./components/models/Catalog";
import { OrderData } from "./components/models/OrderData";
import { API } from "./components/api/API";
import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";

// Компоненты View
import { Modal } from "./components/views/Modal";
import { CardCatalog } from "./components/views/CardCatalog";
import { CardPreview } from "./components/views/CardPreview";
import { BasketView } from "./components/views/BasketView";
import { OrderForm } from "./components/views/OrderForm";
import { FormContacts } from "./components/views/FormContacts";
import { Success } from "./components/views/Success";

// Типы
import type { IProduct, IOrderData } from "./types";

// Утилиты
import { API_URL } from "./utils/constants";
import { apiProducts } from "./utils/data";

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

// Представления
const modal = new Modal(modalContainer, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const successView = new Success(cloneTemplate(successTemplate), events);

// Утилиты
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

// Обновление валидации шага 1 
function updateOrderStep1() {
  const errors = order.validateStep1();
  orderForm.valid = errors.length === 0;
  orderForm.errors = errors;
}

// Универсальная функция для обновления полей заказа
function setOrderField(field: string, value: string) {
  switch (field) {
    case "payment":
      if (value === "online" || value === "cash") {
        order.setPayment(value);
        updateOrderStep1();
      }
      break;
    case "address":
      order.setAddress(value);
      updateOrderStep1();
      break;
    case "email":
      order.setEmail(value);
      break;
    case "phone":
      order.setPhone(value);
      break;
  }
}

// Рендер товаров
function renderProductsAsElements(items: IProduct[]): HTMLElement[] {
  return items.map((item) => {
    const cardElement = cloneTemplate(cardCatalogTemplate!);
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

//  ЛОГИКА 

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
  order.clear();
  modal.render({ content: orderForm.render() });
  updateOrderStep1(); 
});

// Обработка выбора оплаты
events.on<{ value: string }>("order:paymentChange", ({ value }) => {
  if (value === "card") setOrderField("payment", "online");
  else if (value === "cash") setOrderField("payment", "cash");
});

// Обработка ввода адреса
events.on<{ value: string }>("order:addressChange", ({ value }) => {
  setOrderField("address", value);
});

// Обработка отправки формы
let contactsForm: FormContacts | null = null;

events.on("form:submit", () => {
  if (currentStep === 1) {
    // шаг 1: оплата  адрес
    const errors = order.validateStep1();
    if (errors.length > 0) return;

    //  шаг 2
    currentStep = 2;
    const contactsTemplateElement = cloneTemplate(contactsTemplate);
    contactsForm = new FormContacts(contactsTemplateElement, events);
    contactsForm.email = order.getEmail();
    contactsForm.phone = order.getPhone();

    // Обновление валидности при изменении полей
    events.on<{ field: string; value: string }>(
      "contacts:change",
      ({ field, value }) => {
        setOrderField(field, value);
        if (contactsForm) {
          const step2Errors = order.validateStep2();
          contactsForm.valid = step2Errors.length === 0;
          contactsForm.errors = step2Errors;
        }
      },
    );

    // Первоначальная валидация шага 2
    const step2Errors = order.validateStep2();
    contactsForm.valid = step2Errors.length === 0;
    contactsForm.errors = step2Errors;

    modal.render({ content: contactsForm.render() });
  } else {
    // Повторная валидация перед отправкой
    const errors = order.validateStep2();
    if (errors.length > 0) {
      if (contactsForm) {
        contactsForm.errors = errors; 
      }
      return;
    }

    // Проверка суммы
    const total = basket.getTotal();
    if (total <= 0) {
      console.error("Сумма заказа должна быть больше 0");
      return;
    }

    // Подготовка данных
    const orderData: IOrderData = {
      payment: order.getPayment() ?? "cash",
      email: order.getEmail(),
      phone: order.getPhone(),
      address: order.getAddress(),
      total,
      items: basket.getItems().map((i) => i.id),
    };

    // Отправка заказа
    appApi
      .postOrder(orderData)
      .then((result) => {
        basket.clear();
        modal.render({ content: successView.render({ total: result.total }) });
      })
      .catch((err) => {
        console.error("Ошибка при отправке заказа:", err);
      });
  }
});

// Закрытие модалки 
events.on("modal:close", () => {
  currentStep = 1;
  orderForm.errors = [];
});

// Открытие корзины
const basketButton = document.querySelector(".header__basket");
if (!basketButton) throw new Error("Не найдена кнопка корзины .header__basket");
basketButton.addEventListener("click", () => {
  events.emit("basket:open");
});

// Инициализация
events.emit("basket:changed");
