import { Activity } from '@guacamolai/core';
import { goToActivityForm } from './go-to-activity-form';
import { fillArticleForm } from './fill-article-form';
import { fillTalkForm } from './fill-talk-form';

export class AdvocuPage {
  async fillActivityForm(activity: Activity) {
    await goToActivityForm(activity.type);

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
}
