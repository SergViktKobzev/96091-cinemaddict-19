import Observable from '../framework/observable.js';
import {adaptCommentsToClient, adaptCardToClient} from '../utils/adapt-utils.js';

export default class CommentsModel extends Observable {
  #comments = [];
  #commentsApiService = null;

  constructor({commentsApiService}) {
    super();
    this.#commentsApiService = commentsApiService;
  }

  set comments(comments) {
    this.#comments = comments;
  }

  get comments() {
    return this.#comments;
  }

  async init(card) {
    try {
      const comments = await this.#commentsApiService.getComments(card);
      this.#comments = comments.map(adaptCommentsToClient);
    } catch(err) {
      this.#comments = [];
    }
  }

  async addComment(card, comment) {
    try {
      const response = await this.#commentsApiService.addComment(card, comment);
      const updatedCard = adaptCardToClient(response.movie);
      this.#comments = response.comments.map((it) => adaptCommentsToClient(it));
      this._notify(updatedCard);
    } catch(err) {
      throw new Error('Can\'t add comment');
    }
  }

  async deleteComment(id) {
    try {
      await this.#commentsApiService.deleteComment(id);
      this.#comments = this.#comments = this.#comments.filter((comment) => comment.id !== id);
      this._notify(this.#comments);
    } catch(err) {
      throw new Error('Can\'t delete comment');
    }
  }
}
