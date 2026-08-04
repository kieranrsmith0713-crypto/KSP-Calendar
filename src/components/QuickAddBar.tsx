import { useState } from 'react';
import type { FormEvent } from 'react';
import { parseQuickAdd } from '../utils/quickAdd';
import type { CalendarEventInput } from '../types/calendar';

interface QuickAddBarProps {
  onParsed: (draft: CalendarEventInput) => void;
}

export function QuickAddBar({ onParsed }: QuickAddBarProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onParsed(parseQuickAdd(trimmed));
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="quickadd-bar">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Quick add — e.g. "Bins every Sunday at 5pm"'
        className="quickadd-input"
      />
      <button type="submit" className="btn primary small">
        Add
      </button>
    </form>
  );
}
