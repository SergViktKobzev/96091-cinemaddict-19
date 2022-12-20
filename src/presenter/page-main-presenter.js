import {render} from '../render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import MainCardContainerView from '../view/main-card-container-view.js';
import CardContainerView from '../view/card-container-view.js';
import CardListView from '../view/card-list-view.js';
import CardView from '../view/card-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import StatisticView from '../view/statistic-view.js';

const AMOUNT_CARD = 5;

export default class PageMainPresenter {

  constructor({pageMainContainer, pageFooterContainer}) {
    this.pageMainContainer = pageMainContainer;
    this.pageFooterContainer = pageFooterContainer;
  }

  init() {

    const mainCardContainerComponent = new MainCardContainerView();
    const cardContainerComponent = new CardContainerView();
    const cardListComponent = new CardListView();

    render(new FilterView(), this.pageMainContainer);
    render(new SortView(), this.pageMainContainer);
    render(mainCardContainerComponent, this.pageMainContainer);
    render(cardContainerComponent, mainCardContainerComponent.getElement());
    render(cardListComponent, cardContainerComponent.getElement());

    for (let i = 0; i < AMOUNT_CARD; i++) {
      render(new CardView(), cardListComponent.getElement());
    }

    render(new ShowMoreButtonView(), cardContainerComponent.getElement());

    render(new StatisticView(), this.pageFooterContainer);
  }
}
