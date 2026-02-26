import { IProduct } from "../../types";

export class Basket {
  private _items: IProduct[] = [];

  //добавит товар в корзину,если его еще нет
  add(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this._items.push(item);
    }
  }
  // проверит есть ли товар в корзине
  hasItem(id: string): boolean {
    return this._items.some((item) => item.id === id);
  }

  // удалит товар из корзины
  remove(id: string): void {
    this._items = this._items.filter((item) => item.id !== id);
  }

  //вернет копию списка товаров
  getItems(): IProduct[] {
    return [...this._items];
  }

  // вернет сумму товаров
  getTotal(): number {
    return this._items.reduce((sum, item) => sum + item.price!, 0);
  }

  // вернет количество товаров
  getTotalCount(): number {
    return this._items.length;
  }
  // очистит корзину
  clear(): void {
    this._items = [];
  }
}
