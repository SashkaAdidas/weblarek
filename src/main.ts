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
import { CardPreview } from "./components/views/CardPreview";
import { BasketView } from "./components/views/BasketView";
import { OrderForm } from "./components/views/OrderForm";
import { FormContacts } from "./components/views/FormContacts";
import { Success } from "./components/views/Success";
import { CardBasket } from "./components/views/CardBasket";
import { Gallery } from "./components/views/Gallery";

// Типы
import type { IProduct, IOrderData } from "./types";

// Утилиты
import { API_URL } from "./utils/constants";
import { apiProducts } from "./utils/data";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { CardCatalog } from "./components/views/CardCatalog";

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const basketItemTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const orderFormTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// --- Создаём контейнеры ---
const galleryContainer = document.querySelector<HTMLElement>(".gallery");
if (!galleryContainer) throw new Error("Не найден .gallery");

const modalContainer = document.querySelector<HTMLElement>("#modal-container");
if (!modalContainer) throw new Error("Не найден #modal-container");

// События
const events = new EventEmitter();

// Модели
const basket = new Basket(events);
const catalog = new Catalog(events);
const order = new OrderData(events);

// API
const apiClient = new Api(API_URL);
const appApi = new API(apiClient);

// Создаём Gallery
const gallery = new Gallery(galleryContainer);

const modal = new Modal(modalContainer, events);
const header = new Header(
  document.querySelector<HTMLElement>(".header")!,
  events,
);

const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const successView = new Success(cloneTemplate(successTemplate), events);

// Обработчик изменения корзины
events.on("basket:changed", () => {
  header.counter = basket.getTotalCount();

  const basketItems = basket.getItems().map((item, index) => {
    const cardElement = cloneTemplate(basketItemTemplate ?? "");
    cardElement.dataset.id = item.id;

    const card = new CardBasket(cardElement, (id: string) => {
      events.emit("basket:remove", { id });
    });
    card.render(item);
    card.index = index + 1;
    return cardElement;
  });

  basketView.render({
    items: basketItems,
    total: basket.getTotal(),
    disabled: isBasketEmpty(),
  });
});

// Обработчик удаления из корзины
events.on("basket:remove", ({ id }: { id: string }) => {
  basket.remove(id);
});

// Обработчик открытия корзины
events.on("basket:open", () => {
  modal.render({ content: basketView.render() });
});

// Обработчик выбора товара
events.on("product:select", (item: IProduct) => {
  catalog.setPreview(item);
});

// Обработчик изменения превью
events.on("preview:changed", (data: { preview: IProduct }) => {
  const cardElement = cloneTemplate(cardPreviewTemplate);
  const preview = data.preview;

  const card = new CardPreview(cardElement, {
    onBuy: () => {
      const item = catalog.getPreview();
      if (item) {
        if (basket.hasItem(item.id)) {
          basket.remove(item.id);
        } else {
          basket.add(item);
        }
        modal.close();
      }
    },
  });

  card.render(preview);

  if (preview.price === null) {
    card.buttonText = "Недоступно";
    card.buttonDisabled = true;
  } else if (basket.hasItem(preview.id)) {
    card.buttonText = "Удалить из корзины";
    card.buttonDisabled = false;
  } else {
    card.buttonText = "Купить";
    card.buttonDisabled = false;
  }

  modal.render({ content: cardElement });
});

// Обработчик оформления заказа
events.on("basket:order", () => {
  order.clear();
  modal.render({ content: orderForm.render() });
  updateOrderStep1();
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

function isBasketEmpty(): boolean {
  return basket.getItems().length === 0;
}

function renderCatalogItems(items: IProduct[]): HTMLElement[] {
  return items.map((item) => {
    const cardElement = cloneTemplate(cardCatalogTemplate);
    const card = new CardCatalog(cardElement, {
      onClick: () => events.emit("product:select", item),
    });
    card.render(item);
    return cardElement;
  });
}

events.on("items:loaded", () => {
  gallery.render(renderCatalogItems(catalog.getItems()));
});

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

//обработчики подсказок

events.on("order:paymentChange", ({ value }: { value: string }) => {
  if (value === "card") {
    setOrderField("payment", "online");
  } else if (value === "cash") {
    setOrderField("payment", "cash");
  }
});

events.on("order:addressChange", ({ value }: { value: string }) => {
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
        basket.clear();
        order.clear();
        events.emit("order:change");

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
