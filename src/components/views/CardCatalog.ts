import { Card } from "./Card";

interface ICardActions {
  onClick: () => void;
}

export class CardCatalog extends Card {
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    if (actions?.onClick) {
      this.container.addEventListener("click", (e) => {
        e.preventDefault();
        actions.onClick();
      });
    }
  }
}
