'use client';

import {
  DescriptionCopyButton,
  DescriptionDetails,
  DescriptionList,
  DescriptionListColumns,
  DescriptionTerm,
} from '@/components/dentil/description-list/description-list';

export function DescriptionListPrimitivesDemo() {
  return (
    <DescriptionListColumns className="w-full max-w-3xl">
      <DescriptionList>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails className="flex items-center gap-2">
          <span aria-hidden className="bg-primary size-1.5 rounded-full" />
          Active
        </DescriptionDetails>

        <DescriptionTerm>Billing address</DescriptionTerm>
        <DescriptionDetails>
          <address className="not-italic">
            12 Analytical Row
            <br />
            London, EC1A 1BB
            <br />
            United Kingdom
          </address>
        </DescriptionDetails>
      </DescriptionList>

      <DescriptionList>
        <DescriptionTerm>Subscription ID</DescriptionTerm>
        <DescriptionDetails className="flex items-center gap-2">
          <span className="truncate font-mono text-xs">sub_1PqW8eLkdIwHu7ix</span>
          <DescriptionCopyButton value="sub_1PqW8eLkdIwHu7ix" aria-label="Copy subscription ID" />
        </DescriptionDetails>

        <DescriptionTerm>Renews</DescriptionTerm>
        <DescriptionDetails>1 Dec 2026</DescriptionDetails>
      </DescriptionList>
    </DescriptionListColumns>
  );
}
