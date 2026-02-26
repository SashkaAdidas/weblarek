export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods,
  ): Promise<T>;
}

// мой код,добавляю интерфейсы

// товар

export interface IProduct {
  id: string;
  title: string;
  image: string;
  description: string;
  category: string;
  price: number | null;
}

// покупатель

export interface IBuyer {
  email: string;
  phone: string;
  address: string;
  payment: TPayment;
}

// способ оплаты

export type TPayment = "online" | "cash";
