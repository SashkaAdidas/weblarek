import { TPayment } from "../../types";

export class OrderData {
  private _payment: TPayment | null = null;
  private _email: string = "";
  private _phone: string = "";
  private _address: string = "";

  setPayment(value: TPayment): void {
    this._payment = value;
    console.log("setPayment вызван:", value);
  }

  getPayment(): TPayment | null {
    return this._payment;
  }

  setEmail(value: string): void {
    this._email = value;
  }

  getEmail(): string {
    return this._email;
  }

  setPhone(value: string): void {
    this._phone = value;
  }

  getPhone(): string {
    return this._phone;
  }

  setAddress(value: string): void {
    this._address = value;
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
  clear() {
    this._payment = null;
    this._address = "";
    this._email = "";
    this._phone = "";
  }
}
