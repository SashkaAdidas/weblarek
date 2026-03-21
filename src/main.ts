import "./scss/styles.scss";

// Модели
import { Basket } from "./components/models/Basket";
import { Catalog } from "./components/models/Catalog";
import { OrderData } from "./components/models/OrderData";

// API
import { Api } from "./components/base/Api";
import { API } from "./components/api/API";

// View
import { Header } from "./components/views/Header";
import { Modal } from "./components/views/Modal";
import { Gallery } from "./components/views/Gallery";
import { CardPreview } from "./components/views/CardPreview";
import { BasketView } from "./components/views/BasketView";
import { OrderForm } from "./components/views/OrderForm";
import { FormContacts } from "./components/views/FormContacts";
import { Success } from "./components/views/Success";
import { CardBasket } from "./components/views/CardBasket";
import { CardCatalog } from "./components/views/CardCatalog";

// Типы
import type { IProduct, IOrderData, TPayment } from "./types";

// Утилиты
import { API_URL } from "./utils/constants";
import { apiProducts } from "./utils/data";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { EventEmitter } from "./components/base/Events";

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const basketItemTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const orderFormTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// Контейнеры
const galleryContainer = document.querySelector<HTMLElement>(".gallery");
if (!galleryContainer) throw new Error("Не найден .gallery");

const modalContainer = document.querySelector<HTMLElement>("#modal-container");
if (!modalContainer) throw new Error("Не найден #modal-container");

//  События
const events = new EventEmitter();

// Модели
const basket = new Basket(events);
const catalog = new Catalog(events);
const order = new OrderData(events);

//  API
const apiClient = new Api(API_URL);
const appApi = new API(apiClient);

//  Представления View
const header = new Header(
  document.querySelector<HTMLElement>(".header")!,
  events,
);
const modal = new Modal(modalContainer, events);
const gallery = new Gallery(galleryContainer);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const contactsForm = new FormContacts(cloneTemplate(contactsTemplate), events);
const successView = new Success(cloneTemplate(successTemplate), events);

// Единый обработчик обновления данных форм

events.on("buyer:changed", () => {
  orderForm.payment = order.getPayment();
  orderForm.address = order.getAddress();
  const step1Errors = order.validateStep1();
  orderForm.valid = step1Errors.length === 0;
  orderForm.errors = step1Errors;

  contactsForm.email = order.getEmail();
  contactsForm.phone = order.getPhone();
  const step2Errors = order.validateStep2();
  contactsForm.valid = step2Errors.length === 0;
  contactsForm.errors = step2Errors;
});

//  Функция обновления полей заказа
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

//  Изменение полей форм
events.on("form:change", (data: { field: string; value: string }) => {
  setOrderField(data.field, data.value);
  events.emit("buyer:changed");
});

// Сабмит формы адреса и способа оплаты
events.on("order:submit", () => {
  const errors = order.validateStep1();

  if (errors.length > 0) {
    events.emit("buyer:changed");
    return;
  }

  modal.render({ content: contactsForm.render() });
  events.emit("buyer:changed");
});

// Сабмит формы контактов
events.on("contacts:submit", () => {
  if (order.validateStep2().length > 0) {
    events.emit("buyer:changed");
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

      modal.render({
        content: successView.render({ total: result.total }),
      });
    })
    .catch((err) => {
      console.error("Ошибка при отправке заказа:", err);
    });
});

//  Корзина
events.on("basket:changed", () => {
  header.counter = basket.getTotalCount();

  const basketItems = basket.getItems().map((item, index) => {
    const element = cloneTemplate(basketItemTemplate);

    element.dataset.id = item.id;

    const card = new CardBasket(element, (id: string) => {
      events.emit("basket:remove", { id });
    });
    card.render(item);
    card.index = index + 1;
    return element;
  });

  basketView.render({
    items: basketItems,
    total: basket.getTotal(),
    disabled: basket.isEmpty(),
  });
});

events.on("basket:remove", ({ id }: { id: string }) => {
  basket.remove(id);
});

events.on("basket:open", () => {
  modal.render({ content: basketView.render() });
});

events.on("order:open", () => {
  modal.render({ content: orderForm.render() });
  events.emit("buyer:changed");
});

// Продукты
events.on("product:select", (item: IProduct) => {
  catalog.setPreview(item);
});

events.on("preview:changed", (data: { preview: IProduct }) => {
  const element = cloneTemplate(cardPreviewTemplate);
  const card = new CardPreview(element, {
    onBuy: () => {
      const item = catalog.getPreview();
      if (item && item.price !== null) {
        if (basket.hasItem(item.id)) {
          basket.remove(item.id);
        } else {
          basket.add(item);
        }
        modal.close();
      }
    },
  });
  card.render(data.preview);

  const inBasket = basket.hasItem(data.preview.id);
  card.buttonText =
    data.preview.price === null
      ? "Бесценно"
      : inBasket
        ? "Удалить из корзины"
        : "Купить";
  card.buttonDisabled = data.preview.price === null;

  modal.render({ content: element });
});

// Загрузка товаров
appApi
  .getProducts()
  .then((items) => {
    catalog.setItems(items);
  })
  .catch((err) => {
    console.error("Товары не удалось загрузить", err);
    if (catalog.getItems().length === 0) {
      console.warn("API не ответил, используем тестовые данные");
      catalog.setItems(apiProducts.items);
    }
  });

// Галерея
events.on("items:loaded", () => {
  gallery.render(
    catalog.getItems().map((item) => {
      const element = cloneTemplate(cardCatalogTemplate);
      const card = new CardCatalog(element, {
        onClick: () => events.emit("product:select", item),
      });
      card.render(item);
      return element;
    }),
  );
});

events.on("success:close", () => {
  modal.close();
});
