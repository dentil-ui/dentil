import type { Metadata } from 'next';

import { ColorPickerOverviewDemo } from '@/components/demos/color-picker-overview';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Color Picker',
  description:
    'A hex color input for shadcn/ui that reads and writes a 6-digit hex, with a swatch that opens a saturation and hue picker.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  {
    name: 'value',
    type: 'string | null | undefined',
    description:
      '6-digit hex without a leading #, e.g. ed5656. A leading # is ignored. Until the value is six digits, the picker opens on a random color.',
  },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description: (
      <>
        Called on every change with the hex and no <code>#</code>, including a partial value such as <code>ed56</code>.
        Characters other than 0–9 and a–f are removed.
      </>
    ),
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'ed5656'",
    description: 'Shown while the field is empty.',
  },
  { name: 'className', type: 'string', description: 'Applied to the root, around the field and the swatch.' },
  {
    name: '…props',
    type: "ComponentProps<'input'>",
    description: (
      <>
        Other props (<code>id</code>, <code>aria-invalid</code>, <code>aria-describedby</code>, <code>name</code>…) are
        passed to the input. Pass <code>aria-invalid</code> while the value is not six hex digits.
      </>
    ),
  },
];

export default function ColorPickerPage() {
  return (
    <DocsPage
      href="/docs/color-picker"
      sections={sections}
      lead={
        <>
          <C>ColorPicker</C> reads and writes a 6-digit hex with no leading <C>#</C>. Type it, or open the swatch for a
          saturation and hue picker. The first field starts on a random color. The second turns invalid until the value
          is six digits.
        </>
      }
      demo={
        <Example file="color-picker-overview.tsx" padded>
          <ColorPickerOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/color-picker']} />
        <P>
          Files land in <C>components/dentil/color-picker/</C>. Uses the stock shadcn <C>input-group</C>, <C>button</C>{' '}
          and <C>popover</C>, and <C>react-colorful</C> for the saturation and hue picker.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="ColorPicker">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
