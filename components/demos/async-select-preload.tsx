'use client';

import { useState } from 'react';

import { AsyncSelect } from '@/components/async-select/async-select';

type Account = { id: string; name: string; added?: boolean };

const accounts: Account[] = [
  { id: 'acme', name: 'Acme Ltd' },
  { id: 'globex', name: 'Globex' },
  { id: 'initech', name: 'Initech', added: true },
  { id: 'umbrella', name: 'Umbrella' },
  { id: 'hooli', name: 'Hooli' },
];

function loadAccounts(): Promise<Account[]> {
  return new Promise((resolve) => setTimeout(() => resolve(accounts), 800));
}

export function AsyncSelectPreloadDemo() {
  const [account, setAccount] = useState<Account | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <AsyncSelect
        fetcher={loadAccounts}
        preload
        getSearchValue={(option) => option.name}
        value={account?.id}
        defaultOption={account}
        onChange={setAccount}
        getOptionValue={(option) => option.id}
        getDisplayValue={(option) => option.name}
        isOptionDisabled={(option) => option.added === true}
        renderOption={(option) => (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{option.name}</span>
            {option.added ? <span className="text-muted-foreground ml-auto text-xs">Added</span> : null}
          </span>
        )}
        placeholder="Select an account"
        searchPlaceholder="Search accounts..."
        emptyText="No account found."
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{account?.name || '—'}</code>
      </span>
    </div>
  );
}
