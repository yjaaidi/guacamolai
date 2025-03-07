import { Observable, Subject } from 'rxjs';
import { AdvocuScrapForm, AdvocuScrapFormFactory } from './advocu-scrap-form';

export class AdvocuScrapFormFactoryFake implements AdvocuScrapFormFactory {
  form?: AdvocuScrapFormFake;

  async create() {
    return (this.form = new AdvocuScrapFormFake());
  }
}

export class AdvocuScrapFormFake implements AdvocuScrapForm {
  status?: 'disabled' | 'enabled' | 'pending';

  private _urlChange$ = new Subject<string>();
  private _scrapClick$ = new Subject<void>();

  urlChange$ = this._urlChange$.asObservable();
  scrapClick$ = this._scrapClick$.asObservable();

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    this.status = status;
  }

  fillAndSubmitForm(url: string) {
    this._urlChange$.next(url);
    this._scrapClick$.next();
  }
}
