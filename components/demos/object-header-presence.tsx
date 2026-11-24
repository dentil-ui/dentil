'use client';

import { UserRound } from 'lucide-react';
import { useState } from 'react';

import { ObjectHeader, type ObjectHeaderUser } from '@/components/dentil/object-header/object-header';
import { Button } from '@/components/ui/button';

const people: ObjectHeaderUser[] = [
  { id: 'u_2', name: 'Grace Hopper' },
  { id: 'u_3', name: 'Alan Turing' },
  { id: 'u_4', name: 'Katherine Johnson' },
  { id: 'u_5', name: 'Margaret Hamilton' },
  { id: 'u_6', name: 'Edsger Dijkstra' },
  { id: 'u_7', name: 'Barbara Liskov' },
];

const me: ObjectHeaderUser = { id: 'me', name: 'Ada Lovelace' };

export function ObjectHeaderPresenceDemo() {
  const [count, setCount] = useState(2);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="bg-background overflow-hidden rounded-lg border pb-3">
        <ObjectHeader
          icon={UserRound}
          title="Customer"
          id="cus_R8fK2mQ7xLp4Vn"
          presence={[me, ...people.slice(0, count)]}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={count === people.length} onClick={() => setCount(count + 1)}>
          Someone joins
        </Button>
        <Button size="sm" variant="secondary" disabled={count === 0} onClick={() => setCount(count - 1)}>
          Someone leaves
        </Button>
      </div>
    </div>
  );
}
