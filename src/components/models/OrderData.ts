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

  // проверка поля адреса,заполнено ли
  validateDelivery(): boolean {
    return Boolean(this._address);
  }

  // проверка email и телефона, заполнено ли
  validateContact(): boolean {
    return Boolean(this._email && this._phone);
  }

  //вернет обьект с данными покупателя для отправки
  getBuyerData(): IBuyer {
    return {
      payment: this._payment as TPayment,
      email: this._email,
      phone: this._phone,
      address: this._address,
    };
  }
}
