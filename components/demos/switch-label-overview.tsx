'use client';

import { useState } from 'react';

import { SwitchLabel } from '@/components/dentil/switch-label/switch-label';

export function SwitchLabelOverviewDemo() {
  const [emails, setEmails] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <SwitchLabel
        label="Payment emails"
        description="Send an email when a payment fails or a payout is paid."
        checked={emails}
        onCheckedChange={setEmails}
      />
      <SwitchLabel
        label="Weekly digest"
        description="A Monday summary of payments, aligned with the label."
        alignDescription="label"
        checked={digest}
        onCheckedChange={setDigest}
      />
      <SwitchLabel label="Marketing emails" description="Product updates and offers." disabled />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{emails ? 'payment emails on' : 'payment emails off'}</code>,{' '}
        <code className="text-foreground">{digest ? 'digest on' : 'digest off'}</code>
      </span>
    </div>
  );
}
