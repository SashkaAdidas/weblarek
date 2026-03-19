import { Card } from "./Card";

export class CardBasket extends Card {
  private removeButton: HTMLButtonElement | null;

  constructor(container: HTMLElement, private onRemove: (id: string) => void
  ) {
    super(container);

    this.removeButton = container.querySelector(".basket__item-delete");
    
   if (this.removeButton) {
      this.removeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        // Явно указываем тип id из dataset
        const id = this.container.dataset.id;
        if (id) {
          this.onRemove(id);
        }
      });
    }
  }
 
  set index(value: number) {
    const badge = this.container.querySelector(".basket__item-index");
    badge!.textContent = value.toString();
  }
}