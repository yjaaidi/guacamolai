import { Activity } from '@guacamolai/core';
import { AdvocuActivityForm } from './advocu-activity-form';

export class AdvocuActivityFormFake implements AdvocuActivityForm {
  activity?: Activity;

  async fillActivityForm(activity: Activity): Promise<void> {
    this.activity = activity;
  }
}
