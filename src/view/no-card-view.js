import {createElement} from '../render.js';

function creatNoCardTemplate() {
  return `<section class="films">
  <section class="films-list">
    <h2 class="films-list__title">There are no movies in our database</h2>
  </section>
</section>`;
}

export default class NoCardView {
  #element = null;

  get template() {
    return creatNoCardTemplate();
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }
    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }
}
