import { screen } from '@testing-library/dom';
import { Locator } from './dom';
import { ActivityType } from '../core/activity';

export async function goToActivityForm(activityType: ActivityType) {
  await new Locator(() =>
    screen.getByRole('button', { name: 'Add new activity' })
  ).click();

  await new Locator(() => screen.getByText('New activity')).click();

  await new Locator(() =>
    screen.getByRole('heading', { name: _activitySectionMap[activityType] })
  ).click();
}

const _activitySectionMap: Record<ActivityType, string> = {
  article: 'Content creation',
  talk: 'Public speaking',
};
