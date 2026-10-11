'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function CopySkillButton({ skill }: { skill: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      className="self-start"
      onClick={async () => {
        await navigator.clipboard.writeText(skill);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}>
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy skill'}</span>
    </Button>
  );
}
