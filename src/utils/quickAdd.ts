import * as chrono from 'chrono-node';
import type { CalendarEventInput, RecurrenceRule } from '../types/calendar';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

function detectRecurrence(text: string): { rule: RecurrenceRule; strippedText: string } {
  // "every weekday/weekend" has no equivalent in our recurrence model (daily/weekly/monthly/yearly
  // only) — strip the phrase so it doesn't pollute the title, but leave recurrence unset.
  const noRuleIntervalPattern = /\bevery\s+(weekdays?|weekends?)\b/i;
  if (noRuleIntervalPattern.test(text)) {
    return { rule: 'none', strippedText: text.replace(noRuleIntervalPattern, ' ').replace(/\s+/g, ' ').trim() };
  }

  const weekdayPattern = new RegExp(`\\bevery\\s+(${WEEKDAYS.join('|')})(s)?\\b`, 'i');
  if (weekdayPattern.test(text)) {
    // Keep the weekday itself ("Sunday") so chrono can anchor the date — only the "every" goes.
    return { rule: 'weekly', strippedText: text.replace(/\bevery\s+/i, '') };
  }

  const intervalPattern = /\bevery\s*(day|daily|week|weekly|month|monthly|year|yearly|annually)\b/i;
  const intervalMatch = text.match(intervalPattern);
  if (intervalMatch) {
    const word = intervalMatch[1].toLowerCase();
    const rule: RecurrenceRule = word.startsWith('day')
      ? 'daily'
      : word.startsWith('week')
        ? 'weekly'
        : word.startsWith('month')
          ? 'monthly'
          : 'yearly';
    return { rule, strippedText: text.replace(intervalPattern, ' ').replace(/\s+/g, ' ').trim() };
  }

  return { rule: 'none', strippedText: text };
}

// Trims a dangling connector word chrono left behind when it consumed the noun after it
// (e.g. "Anniversary on" once "July 28th" is removed from "Anniversary on July 28th").
function stripDanglingConnectors(text: string): string {
  return text.replace(/\b(on|at|in|for|this|next)\s*$/i, '').trim();
}

/**
 * Turns a sentence like "Bins every Sunday at 5:00pm" into event fields ready
 * to prefill the new-event form — recurrence phrase is parsed out first,
 * then chrono-node resolves whatever date/time is left, and whatever text
 * chrono didn't consume becomes the title.
 */
export function parseQuickAdd(input: string): CalendarEventInput {
  const { rule, strippedText } = detectRecurrence(input);
  const results = chrono.parse(strippedText, new Date(), { forwardDate: true });

  let start: Date;
  let allDay: boolean;
  let title: string;

  if (results.length > 0) {
    const result = results[0];
    start = result.start.date();
    allDay = !result.start.isCertain('hour');
    title = stripDanglingConnectors(
      (strippedText.slice(0, result.index) + strippedText.slice(result.index + result.text.length))
        .replace(/\s+/g, ' ')
        .trim(),
    );
  } else {
    start = new Date();
    allDay = true;
    title = strippedText.trim();
  }

  if (!title) title = input.trim();

  const end = allDay ? start : new Date(start.getTime() + DEFAULT_DURATION_MS);

  return {
    title,
    description: null,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    all_day: allDay,
    location: null,
    category: null,
    recurrence_rule: rule === 'none' ? null : rule,
  };
}
