import { IProduct } from "../../types";

export class Catalog {
  private _items: IProduct[] = [];
  private _preview: IProduct | null = null;

  // принимаем массив товаров и сохраняем
  setItems(items: IProduct[]): void {
  if (Array.isArray(items)) {
        this._items = items;
    } else {
        this._items = [];
        console.warn('Catalog.setItems: передан не массив', items);
    }
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
