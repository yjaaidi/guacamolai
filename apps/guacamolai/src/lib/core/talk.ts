export interface Talk {
  url: string;

  title: string;
  description: string;

  attendees?: number;
  online?: boolean;
  date?: string;
  country?: string;
  city?: string;
}
