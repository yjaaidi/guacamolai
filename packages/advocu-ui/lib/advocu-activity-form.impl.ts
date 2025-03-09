import { AdvocuActivityForm } from '@guacamolai/advocu-core';
import { Activity, ActivityType } from '@guacamolai/core';
import { Locator } from '@guacamolai/shared-ui/dom';
import { screen } from '@testing-library/dom';
import { fillArticleForm } from './fill-article-form';
import { fillTalkForm } from './fill-talk-form';

export class AdvocuActivityFormImpl implements AdvocuActivityForm {
  #activitySectionMap: Record<ActivityType, string> = {
    article: 'Content creation',
    talk: 'Public speaking',
  };

  async fillActivityForm(activity: Activity) {
    await this.#goToActivityForm(activity.type);

    /* HACK: for some reason we have to wait a bit here,
     * otherwise, Advocu closes the form. */
    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (activity.type) {
      case 'article':
        await fillArticleForm(activity);
        break;
      case 'talk':
        await fillTalkForm(activity);
        break;
    }
  }

  async #goToActivityForm(activityType: ActivityType) {
    await new Locator(() =>
      screen.getByRole('button', { name: 'Add new activity' })
    ).click();

    await new Locator(() => screen.getByText('New activity')).click();

    await new Locator(() =>
      screen.getByRole('heading', {
        name: this.#activitySectionMap[activityType],
      })
    ).click();
  }
}
