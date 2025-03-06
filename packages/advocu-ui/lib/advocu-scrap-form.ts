import { tryInjectScrapForm, updateScrapButton } from './try-inject-scrap-form';

export class AdvocuScrapForm {
  private _onScrapClick: () => void;
  private _onUrlChange: (url: string) => void;

  constructor({
    onScrapClick,
    onUrlChange,
  }: {
    onScrapClick: () => void;
    onUrlChange: (url: string) => void;
  }) {
    this._onScrapClick = onScrapClick;
    this._onUrlChange = onUrlChange;
  }

  async inject() {
    await tryInjectScrapForm({
      onClick: this._onScrapClick,
      onUrlChange: this._onUrlChange,
    });
  }

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    updateScrapButton(status);
  }
}
