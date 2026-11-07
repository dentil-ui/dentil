'use client';

import { useState } from 'react';

import { AsyncSelect } from '@/components/dentil/async-select/async-select';
import { Button } from '@/components/ui/button';

const teams = ['Design', 'Finance', 'Support'];

function searchTeams(query: string): Promise<string[]> {
  const q = query.trim().toLowerCase();
  const matches = teams.filter((team) => team.toLowerCase().includes(q));
  return new Promise((resolve) => setTimeout(() => resolve(matches), 800));
}

export function AsyncSelectEmptyDemo() {
  const [team, setTeam] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <AsyncSelect
        fetcher={searchTeams}
        value={team}
        defaultOption={team}
        onChange={setTeam}
        getOptionValue={(option) => option}
        getDisplayValue={(option) => option}
        renderOption={(option) => <span className="truncate">{option}</span>}
        placeholder="Select a team"
        searchPlaceholder="Search teams..."
        emptyText={({ query, close }) => (
          <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
            <p className="text-muted-foreground text-sm">{query ? `No team named ${query}.` : 'No teams found.'}</p>
            {query ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTeam(query);
                  close();
                }}>
                Use {query}
              </Button>
            ) : null}
          </div>
        )}
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{team || '—'}</code>
      </span>
    </div>
  );
}
