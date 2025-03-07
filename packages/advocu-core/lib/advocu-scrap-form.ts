import { Observable } from 'rxjs';

export interface AdvocuScrapFormFactory {
  create(): Promise<AdvocuScrapForm | undefined>;
}

export interface AdvocuScrapForm {
  scrapClick$: Observable<void>;

  urlChange$: Observable<string>;

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending'): void;
}
