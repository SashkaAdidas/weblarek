import { TPayment } from "../../types";
import { IEvents } from "../base/Events";

export class OrderData {
  private _payment: TPayment | null = null;
  private _email: string = "";
  private _phone: string = "";
  private _address: string = "";

  constructor(private events: IEvents) {}

  setPayment(value: TPayment): void {
    this._payment = value;
    this.events.emit("buyer:changed");
  }

  getPayment(): TPayment | null {
    return this._payment;
  }

  setEmail(value: string): void {
    this._email = value;
    this.events.emit("buyer:changed");
  }

  getEmail(): string {
    return this._email;
  }

  setPhone(value: string): void {
    this._phone = value;
    this.events.emit("buyer:changed");
  }

  getPhone(): string {
    return this._phone;
  }

  setAddress(value: string): void {
    this._address = value;
    this.events.emit("buyer:changed");
  }

  getAddress(): string {
    return this._address;
  }

  validateStep1(): string[] {
    const errors: string[] = [];
    if (!this._payment) errors.push("Не выбран способ оплаты");
    if (!this._address) errors.push("Не указан адрес доставки");
    return errors;
  }

  validateStep2(): string[] {
    const errors: string[] = [];
    if (!this._email) errors.push("Требуется email");
    if (!this._phone) errors.push("Требуется телефон");
    return errors;
  }

  clear(): void {
    this._payment = null;
    this._address = "";
    this._email = "";
    this._phone = "";
    this.events.emit("buyer:changed");
  }
}