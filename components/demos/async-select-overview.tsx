'use client';

import { useState } from 'react';

import { AsyncSelect } from '@/components/async-select/async-select';

type Person = { id: string; name: string; email: string };

const people: Person[] = [
  { id: 'ada', name: 'Ada Lovelace', email: 'ada@analytical.engine' },
  { id: 'grace', name: 'Grace Hopper', email: 'grace@navy.mil' },
  { id: 'katherine', name: 'Katherine Johnson', email: 'katherine@nasa.gov' },
  { id: 'margaret', name: 'Margaret Hamilton', email: 'margaret@mit.edu' },
  { id: 'annie', name: 'Annie Easley', email: 'annie@nasa.gov' },
  { id: 'dorothy', name: 'Dorothy Vaughan', email: 'dorothy@nasa.gov' },
];

function searchPeople(query: string): Promise<Person[]> {
  const q = query.trim().toLowerCase();
  const matches = people.filter(
    (person) => person.name.toLowerCase().includes(q) || person.email.toLowerCase().includes(q)
  );
  return new Promise((resolve) => setTimeout(() => resolve(matches), 800));
}

export function AsyncSelectOverviewDemo() {
  const [person, setPerson] = useState<Person | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <AsyncSelect
        fetcher={searchPeople}
        value={person?.id}
        defaultOption={person}
        onChange={setPerson}
        getOptionValue={(option) => option.id}
        getDisplayValue={(option) => option.name}
        renderOption={(option) => (
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{option.name}</span>
            <span className="text-muted-foreground truncate text-xs">{option.email}</span>
          </span>
        )}
        placeholder="Select a person"
        searchPlaceholder="Search people..."
        emptyText="No person found."
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{person?.name || '—'}</code>
      </span>
    </div>
  );
}
