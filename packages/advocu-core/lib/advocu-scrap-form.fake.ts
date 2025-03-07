import { AdvocuScrapForm, AdvocuScrapFormFactory } from './advocu-scrap-form';

export class AdvocuScrapFormFactoryFake implements AdvocuScrapFormFactory {
  form?: AdvocuScrapFormFake;

  async create() {
    return (this.form = new AdvocuScrapFormFake());
  }
}

export class AdvocuScrapFormFake implements AdvocuScrapForm {
  private _onClick?: () => void;
  private _onUrlChange?: (url: string) => void;
  status?: 'disabled' | 'enabled' | 'pending';

  onScrapClick(onClick: () => void) {
    this._onClick = onClick;
  }

  onUrlChange(onUrlChange: (url: string) => void) {
    this._onUrlChange = onUrlChange;
  }

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    this.status = status;
  }

  fillAndSubmitForm(url: string) {
    this._onUrlChange?.(url);
    this._onClick?.();
  }
}
