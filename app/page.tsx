import { CopySkillButton } from '@/components/docs/copy-skill-button';
import { DocsCards } from '@/components/docs/docs-cards';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, P } from '@/components/docs/page-shell';
import { Step, Steps } from '@/components/docs/steps';
import { getAgentSkill } from '@/lib/agent-skill';
import { registryItemUrl, siteConfig } from '@/lib/site';

export default async function Home() {
  const skill = await getAgentSkill();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-16 px-5 py-16 md:py-20">
      <section className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Production dashboard primitives for shadcn/ui.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          Data tables, modals, sheets, date pickers and form inputs you install with the shadcn CLI and own outright.
          They build on stock shadcn/ui primitives, so they pick up your theme and work in any React framework.
        </p>
      </section>

      <section aria-labelledby="install" className="flex max-w-3xl scroll-mt-20 flex-col gap-6">
        <h2 id="install" className="text-xl font-semibold tracking-tight">
          Get started
        </h2>
        <div className="flex flex-col gap-3">
          <h3 id="agent-skill" className="scroll-mt-20 font-medium">
            Set up with your AI
          </h3>
          <P>
            Give your coding agent the dentil skill, then ask it to add a data table, modals, sheets or form inputs.
            Paste it into the chat, or save it as <C>.cursor/skills/dentil/SKILL.md</C> or{' '}
            <C>.claude/skills/dentil/SKILL.md</C> so the agent uses it whenever dentil comes up. Agents can also read it
            from <C>{siteConfig.url}/skill.md</C>.
          </P>
          <CopySkillButton skill={skill} />
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <span aria-hidden className="bg-border h-px flex-1" />
          or
          <span aria-hidden className="bg-border h-px flex-1" />
        </div>
        <h3 className="-mb-2 font-medium">Set up manually</h3>
        <Steps>
          <Step
            title="Install a component"
            description={
              <>
                dentil is in the <A href="https://ui.shadcn.com/docs/directory">shadcn registry directory</A>, so the
                CLI resolves <C>@dentil</C> names with no setup and adds any stock shadcn/ui components they need.
                Requires React 19 and Tailwind v4, with a Radix or Base UI style.
              </>
            }>
            <InstallCommand title="By name" items={['@dentil/data-table']} />
            <InstallCommand title="By URL, for older CLI versions" items={[registryItemUrl('@dentil/data-table')]} />
          </Step>
          <Step
            title="Read the docs"
            description={
              <>
                Each <A href="#components">component</A> has a page with setup steps, live examples and an API
                reference.
              </>
            }
          />
        </Steps>
      </section>

      <div id="components" className="scroll-mt-20">
        <DocsCards />
      </div>
    </main>
  );
}
