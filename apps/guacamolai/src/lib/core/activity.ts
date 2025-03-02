export interface ActivityBase {
  url: string;

  title: string;
  description: string;

  date?: string;
}

export interface Article extends ActivityBase {
  type: 'article';
}

export interface Talk extends ActivityBase {
  type: 'talk';
  attendees?: number;
  online?: boolean;
  city?: string;
  country?: string;
}

export type Activity = Article | Talk;
