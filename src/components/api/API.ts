import { IApi } from "../../types";
import { IProduct, IBuyer, TPayment } from "../../types";

export interface IOrderData extends IBuyer {
  total: number;
  items: string[];
}

export interface IOrderResult {
  id: string;
  total: number;
}
export interface IProductList {
  total: number;
  items: IProduct[];
}

export class API {
  private _api: IApi;

  constructor(api: IApi) {
    this._api = api;
  }

  getProducts(): Promise<IProduct[]> {
    return this._api
      .get<IProductList>("/product/")
      .then((result) => result.items);
  }
  postOrder(orderData: IOrderData): Promise<IOrderResult> {
    return this._api.post<IOrderResult>("/order/", orderData);
  }
}
