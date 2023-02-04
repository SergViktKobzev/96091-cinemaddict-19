import {render, remove} from '../framework/render.js';
import AppModel from '../model/app-model.js';
import FilterModel from './model/filter-model.js';
import {getRandomCardWithComments} from '../mock/card-with-comment-mock.js';
import {generateFilter} from '../mock/filter-mock.js';
import CardPresenter from './card-presenter.js';
import {SortType, UpdateType, UserAction} from '../const.js';
import {sortByDate, sortByRating} from '../utils/sort-utils.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import MainCardContainerView from '../view/main-card-container-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import StatisticView from '../view/statistic-view.js';
import UserView from '../view/user-view.js';
import NoCardView from '../view/no-card-view.js';

const CARDS_COUNT = 12;
const CARDS_COUNT_PER_STEP = 5;

export default class AppPresenter {
  #pageMainElement = null;
  #pageStatisticsElement = null;
  #pageHeaderElement = null;
  #appModel = null;
  #mainComponent = null;
  #showMoreButtonComponent = null;
  #sortComponent = null;
  #renderedCardCount = CARDS_COUNT_PER_STEP;
  #filters = null;
  #cardPresenter = null;
  #cardPresenterMap = new Map();
  #currentSortType = SortType.DEFAULT;

  constructor({pageMainElement, pageStatisticsElement, pageHeaderElement}) {
    this.#pageMainElement = pageMainElement;
    this.#pageStatisticsElement = pageStatisticsElement;
    this.#pageHeaderElement = pageHeaderElement;
    const cards = Array.from({length: CARDS_COUNT}, getRandomCardWithComments);
    this.#appModel = new AppModel();
    this.#appModel.cards = cards;
    const filterModel = new FilterModel();

    this.#appModel.addObserver(this.#handleModelEvent);
  }

  get cards() {
    switch (this.#currentSortType) {
      case SortType.DATE:
        return [...this.#appModel.cards].sort(sortByDate);
      case SortType.RATING:
        return [...this.#appModel.cards].sort(sortByRating);
    }
    return this.#appModel.cards;
  }

  init() {
    this.#renderCards();
  }

  #renderCards() {
    render(new UserView(), this.#pageHeaderElement);
    this.#renderFilter(this.cards);

    if (this.cards.length === 0 || !this.cards) {
      render(new NoCardView, this.#pageMainElement);
      return;
    }

    this.#renderSort();
    this.#renderCardsList();
    render(new StatisticView(this.cards.length), this.#pageStatisticsElement);
  }

  #renderFilter(cards) {
    this.#filters = generateFilter(cards);

    render(new FilterView(this.#filters), this.#pageMainElement);
  }

  #renderSort() {
    this.#sortComponent = new SortView(this.#handleSortTypeChange);

    render(this.#sortComponent, this.#pageMainElement);
  }

  #renderCardsList() {
    this.#mainComponent = new MainCardContainerView();

    render(this.#mainComponent, this.#pageMainElement);

    for (let i = 0; i < Math.min(this.cards.length, CARDS_COUNT_PER_STEP); i++) {
      this.#renderCard(this.cards[i]);
    }

    if (this.cards.length > CARDS_COUNT_PER_STEP) {
      this.#showMoreButtonComponent = new ShowMoreButtonView(this.#handleShowMoreButtonClick);
      render(this.#showMoreButtonComponent, this.#mainComponent.filmList);
    }
  }

  #renderCard(card) {
    this.#cardPresenter = new CardPresenter(
      this.#mainComponent,
      this.#resetCardsDetails,
      this.#handleViewAction
    );
    this.#cardPresenter.init(card);
    this.#cardPresenterMap.set(card.id, this.#cardPresenter);
  }

  #clearCards() {
    this.#cardPresenterMap.forEach((presenter) => presenter.destroy());
    this.#cardPresenterMap.clear();
    this.#renderedCardCount = CARDS_COUNT_PER_STEP;
    remove(this.#mainComponent);
    remove(this.#showMoreButtonComponent);
  }

  #resetCardsDetails = () => {
    this.#cardPresenterMap.forEach((presenter) => presenter.resetCardDetails());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearCards();
    this.#renderCardsList();
  };

  #handleViewAction = (actionType, updateType, updatedCard) => {
    switch (actionType) {
      case UserAction.UPDATE_CARD:
        this.#appModel.updateCard(updateType, updatedCard);
        break;
      case UserAction.ADD_CARD:
        this.#appModel.addCard(updateType, updatedCard);
        break;
      case UserAction.DELETE_CARD:
        this.#appModel.deleteCard(updateType, updatedCard);
        break;
    }
  };

  #handleModelEvent = (updateType, updatedCard) => {
    console.log(updateType, updatedCard);
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)
        this.#cardPresenterMap.get(updatedCard.id).init(updatedCard);
        break;
      case UpdateType.MINOR:
        // - обновить список (например, когда задача ушла в архив)
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        break;
    }
  };

  #handleShowMoreButtonClick = () => {
    this.cards
      .slice(this.#renderedCardCount, this.#renderedCardCount + CARDS_COUNT_PER_STEP)
      .forEach((card) => this.#renderCard(card));

    this.#renderedCardCount += CARDS_COUNT_PER_STEP;

    if (this.#renderedCardCount >= this.cards.length) {
      this.#showMoreButtonComponent.element.remove();
      this.#showMoreButtonComponent.removeElement();
    }
  };
}
