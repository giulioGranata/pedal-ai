const IT_LOCALE = 'it-IT';

export function parseISODateUTC(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatShortDate(value: string): string {
  return parseISODateUTC(value).toLocaleDateString(IT_LOCALE, { day: 'numeric', month: 'short' });
}

export function formatWeekdayShortDate(value: string): string {
  return parseISODateUTC(value).toLocaleDateString(IT_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
}
