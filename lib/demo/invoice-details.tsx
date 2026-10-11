import { DateCell } from '@/components/data-table/date-cell';

import { type Invoice, formatAmount } from './invoices';

/** The panel shown under an expanded invoice row. */
export function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  return (
    <dl className="flex flex-wrap gap-x-12 gap-y-3 text-sm">
      <div>
        <dt className="text-muted-foreground text-xs">Billed to</dt>
        <dd className="font-medium">{invoice.customer.name}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-xs">Email</dt>
        <dd>{invoice.customer.email}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-xs">Due</dt>
        <dd>
          <DateCell date={invoice.due} showTime={false} />
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-xs">{invoice.status === 'paid' ? 'Amount paid' : 'Amount due'}</dt>
        <dd className="font-medium tabular-nums">
          {invoice.status === 'void' ? formatAmount(0) : formatAmount(invoice.amount)}
        </dd>
      </div>
    </dl>
  );
}
