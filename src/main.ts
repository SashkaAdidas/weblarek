import "./scss/styles.scss";

import { Basket } from "./components/models/Basket";
import { Catalog } from "./components/models/Catalog";
import { OrderData } from "./components/models/OrderData";

import { API } from "./components/api/API";
import { Api } from "./components/base/Api";

import { API_URL } from "./utils/constants";
// импорт тест данных
import { apiProducts } from "./utils/data";

// сщздаем экземпляры классов
const basket = new Basket();
const catalog = new Catalog();
const order = new OrderData();

const apiClient = new Api(API_URL);
//передаем клиент в API
const appApi = new API(apiClient);

//загрузка товаров с сервера
appApi
  .getProducts()
  .then((items) => {
    catalog.setItems(items);
    console.log("Товары загружены:", catalog.getItems());
  })
  .catch((err) => {
    console.error("Товары не удалось загрузить", err);
  });
console.log("API_URL:", API_URL);

// ---ТЕСТИМ CATALOG---
console.log("---ТЕСТ Catalog---");

// сохранит товары
catalog.setItems(apiProducts.items);

// получит и вывести
console.log("Массив товаров из каталога", catalog.getItems());

// получит первый товар
const firstItem = apiProducts.items[0];
const secondItem = apiProducts.items[1];
console.log("Первый товар:", firstItem);

// ищем по id
const item = catalog.getItemById(secondItem.id);
if (item) {
  console.log("Товар найден:", item);
} else {
  console.log("Товара с этим id нет");
}

// ---ТЕСТИМ КОРЗИНУ---
console.log("---ТЕСТ Basket---");

//добавляем товар (1)
const itemToAdd = catalog.getItemById(firstItem.id);
if (itemToAdd) {
  basket.add(itemToAdd);
  console.log("Товар добавлен в корзину:", itemToAdd.title);
} else {
  console.log("Товар не найден — не удалось добавить");
}

// проверка содержимого корзины
console.log("Товары в корзине:", basket.getItems());

// проверка количества
console.log("Количество товаров в корзине:", basket.getTotalCount());

// проверка суммы
console.log("Общая стоимость:", basket.getTotal());

//---ТЕСТИМ orderData---
console.log("---ТЕСТ orderData---");

order.setPayment("online");
order.setEmail("user@test.com");
order.setPhone("+79991234567");
order.setAddress("ул. Ленина, д. 10");

console.log("Способ оплаты:", order.getPayment());
console.log("Email:", order.getEmail());
console.log("Phone:", order.getPhone());
console.log("Address:", order.getAddress());
