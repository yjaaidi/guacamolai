import { Activity } from '@guacamolai/core';

export interface AdvocuActivityForm {
  fillActivityForm(activity: Activity): Promise<void>;
}
