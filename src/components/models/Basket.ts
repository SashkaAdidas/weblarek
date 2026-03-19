                                              // ИСПРАВЛЕНО
import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Basket {
  private _items: IProduct[] = [];

  constructor(private events: IEvents) {}

  add(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this._items.push(item);
      this.events.emit("basket:changed");
    }
  }

  hasItem(id: string): boolean {
    return this._items.some((item) => item.id === id);
  }

  remove(id: string): void {
    this._items = this._items.filter((item) => item.id !== id);
    this.events.emit("basket:changed");
  }

  getItems(): IProduct[] {
    return [...this._items];
  }

  getTotal(): number {
    return this._items.reduce((sum, item) => {
      return sum + (typeof item.price === 'number' ? item.price : 0);
    }, 0);
  }

  getTotalCount(): number {
    return this._items.length;
  }

  clear(): void {
    this._items = [];
    this.events.emit("basket:changed");
  }
}                                       