import { ActivityType } from '@guacamolai/core';
import { Locator } from '@guacamolai/shared-ui/dom';
import { screen } from '@testing-library/dom';

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
