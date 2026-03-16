export type TCategory =
  | "софт-скил"
  | "хард-скил"
  | "кнопка"
  | "дополнительное"
  | "другое";

export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods,
  ): Promise<T>;
}

// Товар
export interface IProduct {
  id: string;
  title: string;
  image: string;
  description: string;
  category: string;
  price: number | null;
}

// Список товаров
export interface IProductList {
  total: number;
  items: IProduct[];
}

// Покупатель
export interface IBuyer {
  email: string;
  phone: string;
}

// Полный заказ
export interface IOrderData extends IBuyer {
  payment: TPayment; // "online" | "cash"
  address: string;
  total: number;
  items: string[]; // массив ID товаров
}

// Результат заказа — минимальный объект
export interface IOrderResult {
  total: number;
}

// Способ оплаты
export type TPayment = "online" | "cash";
