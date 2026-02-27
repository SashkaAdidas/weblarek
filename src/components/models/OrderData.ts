import { IBuyer, TPayment } from "../../types";

export class OrderData {
  private _payment: TPayment | null = null;
  private _email: string = "";
  private _phone: string = "";
  private _address: string = "";

  // установка способа оплаты
  setPayment(payment: TPayment): void {
    this._payment = payment;
  }

  // вернет способ оплаты
  getPayment(): TPayment | null {
    return this._payment;
  }

  // установит email
  setEmail(value: string): void {
    this._email = value;
  }

  // вернет email
  getEmail(): string {
    return this._email;
  }

  //установит телефон
  setPhone(value: string): void {
    this._phone = value;
  }

  // вернет телефон
  getPhone() {
    return this._phone;
  }

  // установит адрес
  setAddress(value: string): void {
    this._address = value;
  }
  // вернет адрес
  getAddress() {
    return this._address;
  }

  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    if (!this._payment) {
      errors.payment = "Не выбран способ оплаты";
    }
    if (!this._email) {
      errors.email = "Укажите email";
    }
    if (!this._phone) {
      errors.phone = "Укажите телефон";
    }
    if (!this._address) {
      errors.address = "Укажите адрес доставки";
    }

    return errors;
  }
}
