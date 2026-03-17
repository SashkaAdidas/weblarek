import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Catalog {
  private _items: IProduct[] = [];
  private _preview: IProduct | null = null;

constructor(protected events: IEvents) {}
  // принимаем массив товаров и сохраняем
  setItems(items: IProduct[]): void {
  this._items = items;
  this.events.emit('catalog:updated', { items }); // ← событие
}

  // вернем копию массива
  getItems(): IProduct[] {
    return [...this._items];
  }

  // ищет товар по id
  getItemById(id: string): IProduct | undefined {
    return this._items.find((item) => item.id === id);
  }

  // сохранит преданный товар как превью
  setPreview(item: IProduct): void {
    this._preview = item;
  }

  // вернет текущий превью-товар
  getPreview(): IProduct | null {
    return this._preview;
  }
}
