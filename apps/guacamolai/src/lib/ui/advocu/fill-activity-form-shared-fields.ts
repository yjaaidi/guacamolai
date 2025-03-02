import { Activity } from '../../core/activity';
import { activityFormLocators } from './activity-form-locators';

export async function fillActivityFormSharedFields(activity: Activity) {
  await activityFormLocators.title.fill(activity.title);
  await activityFormLocators.description.setTextContent(activity.description);
  await activityFormLocators.url.fill(activity.url);

  if (activity.date) {
    await activityFormLocators.date.fill(activity.date);
  }
}
