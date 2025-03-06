export interface AdvocuScrapFormFactory {
  create(): Promise<AdvocuScrapForm | undefined>;
}

export interface AdvocuScrapForm {
  onScrapClick(onClick: () => void): void;

  onUrlChange(onUrlChange: (url: string) => void): void;

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending'): void;
}
