import "./scss/styles.scss";

import { Basket } from "./components/models/Basket";
import { Catalog } from "./components/models/Catalog";
import { OrderData } from "./components/models/OrderData";
import { API } from "./components/api/API";
import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";

// Компоненты View
import { Header } from "./components/views/Header";
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
import { cloneTemplate } from "./utils/utils";

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

// События
const events = new EventEmitter();

// Модели
const basket = new Basket();
const catalog = new Catalog(events);
const order = new OrderData(events);

// API
const apiClient = new Api(API_URL);
const appApi = new API(apiClient);

// Представления
const modal = new Modal(modalContainer, events);
const header = new Header(
  document.querySelector<HTMLElement>(".header")!,
  events,
);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const successView = new Success(cloneTemplate(successTemplate), events);

events.on("basket:changed", () => {
  header.counter = basket.getTotalCount();
  basketView.render({
    items: basket.getItems(),
    total: basket.getTotal(),
    disabled: isBasketEmpty(),
  });
});

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
// Синхронизация форм с моделью order
events.on("order:change", () => {
  orderForm.payment = order.getPayment();
  orderForm.address = order.getAddress();
  updateOrderStep1();

  if (contactsForm) {
    contactsForm.email = order.getEmail();
    contactsForm.phone = order.getPhone();
    const step2Errors = order.validateStep2();
    contactsForm.valid = step2Errors.length === 0;
    contactsForm.errors = step2Errors;
  }
});
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

// Проверка, есть ли товар в корзине
function isInBasket(id: string): boolean {
  return basket.getItems().some((item) => item.id === id);
}

let currentStep = 1;
let contactsForm: FormContacts | null = null;
let contactsChangeHandler:
  | ((data: { field: string; value: string }) => void)
  | null = null;

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
events.on("form:submit", () => {
  if (currentStep === 1) {
    const errors = order.validateStep1();
    if (errors.length > 0) return;

    currentStep = 2;
    const contactsTemplateElement = cloneTemplate(contactsTemplate);
    contactsForm = new FormContacts(contactsTemplateElement, events);
    contactsForm.email = order.getEmail();
    contactsForm.phone = order.getPhone();

    // Очищаю старый обработчик
    if (contactsChangeHandler) {
      events.off("contacts:change", contactsChangeHandler);
    }

    // Создаю новый
    contactsChangeHandler = ({ field, value }) => {
      setOrderField(field, value);
      if (contactsForm) {
        const step2Errors = order.validateStep2();
        contactsForm.valid = step2Errors.length === 0;
        contactsForm.errors = step2Errors;
      }
    };

    events.on("contacts:change", contactsChangeHandler);

    // Первоначальная валидация
    const step2Errors = order.validateStep2();
    contactsForm.valid = step2Errors.length === 0;
    contactsForm.errors = step2Errors;

    modal.render({ content: contactsForm.render() });
  } else {
    const errors = order.validateStep2();
    if (errors.length > 0) {
      if (contactsForm) {
        contactsForm.errors = errors;
      }
      return;
    }

    const total = basket.getTotal();
    if (total <= 0) {
      console.error("Сумма заказа должна быть больше 0");
      return;
    }

    const orderData: IOrderData = {
      payment: order.getPayment() ?? "cash",
      email: order.getEmail(),
      phone: order.getPhone(),
      address: order.getAddress(),
      total,
      items: basket.getItems().map((i) => i.id),
    };

    appApi
      .postOrder(orderData)
      .then((result) => {
        basket.clear(); // очищаем корзину
        order.clear(); // очищаем данные заказа

        events.emit("basket:changed"); //  обновит хедер и корзину
        events.emit("order:change"); //  обновит формы: оплата, адрес и т.д.

        modal.render({
          content: successView.render({ total: result.total }),
        });
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
  if (contactsChangeHandler) {
    events.off("contacts:change", contactsChangeHandler);
    contactsChangeHandler = null;
  }
});

// Инициализация
events.emit("basket:changed");
