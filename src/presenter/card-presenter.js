import {render, replace, remove} from '../framework/render.js';
import CardView from '../view/card-view.js';
import {UserAction, UpdateType} from '../const.js';

export default class CardPresenter {
  #mainComponent = null;
  #card = null;
  #cardComponent = null;
  #handleViewAction = null;
  #showCardDetails = null;

  constructor(
    cardContainer,
    showCardDetails,
    onViewAction,
  ) {
    this.#mainComponent = cardContainer;
    this.#showCardDetails = showCardDetails;
    this.#handleViewAction = onViewAction;
  }

  init(card) {
    this.#card = card;
    const prevCardComponent = this.#cardComponent;

    this.#cardComponent = new CardView(
      this.#card,
      this.#handleWatchlistClick,
      this.#handleWatchedClick,
      this.#handleFavoriteClick,
      this.#handleCardLinkClick
    );

    if (prevCardComponent === null) {
      render(this.#cardComponent, this.#mainComponent.filmListContainer);
      return;
    }

    if (this.#mainComponent.filmListContainer.contains(prevCardComponent.element)) {
      replace(this.#cardComponent, prevCardComponent);
    }
    remove(prevCardComponent);
  }

  destroy() {
    remove(this.#cardComponent);
  }

  setAborting() {
    this.#cardComponent.shake();
  }

  #handleWatchlistClick = () => {
    this.#card.userDetails.isInWatchlist = !this.#card.userDetails.isInWatchlist;
    this.#handleViewAction(UserAction.UPDATE_CARD, UpdateType.CARD_UPDATING, this.#card);
  };

  #handleWatchedClick = () => {
    this.#card.userDetails.isWatched = !this.#card.userDetails.isWatched;
    this.#handleViewAction(UserAction.UPDATE_CARD, UpdateType.CARD_UPDATING, this.#card);
  };

  #handleFavoriteClick = () => {
    this.#card.userDetails.isFavorite = !this.#card.userDetails.isFavorite;
    this.#handleViewAction(UserAction.UPDATE_CARD, UpdateType.CARD_UPDATING, this.#card);
  };

  #handleCardLinkClick = (card) => {
    this.#showCardDetails(card);
  };
}
