import { Observable } from 'rxjs';

export interface AdvocuScrapFormFactory {
  create(): Promise<AdvocuScrapForm | undefined>;
}

export interface AdvocuScrapForm {
  scrapSubmit$: Observable<void>;

  urlChange$: Observable<string>;

  showErrorToast(error: string): void;

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending'): void;
}
