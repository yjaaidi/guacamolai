import { Subject } from 'rxjs';
import { AdvocuScrapForm, AdvocuScrapFormFactory } from './advocu-scrap-form';

export class AdvocuScrapFormFactoryFake implements AdvocuScrapFormFactory {
  form?: AdvocuScrapFormFake;

  async create() {
    return (this.form = new AdvocuScrapFormFake());
  }
}

export class AdvocuScrapFormFake implements AdvocuScrapForm {
  status?: 'disabled' | 'enabled' | 'pending';

  #urlChange$ = new Subject<string>();
  #scrapSubmit$ = new Subject<void>();

  urlChange$ = this.#urlChange$.asObservable();
  scrapSubmit$ = this.#scrapSubmit$.asObservable();

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    this.status = status;
  }

  fillAndSubmitForm(url: string) {
    this.#urlChange$.next(url);
    this.#scrapSubmit$.next();
  }
}
