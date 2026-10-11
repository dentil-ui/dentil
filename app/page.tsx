import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { CodeBlock } from '@/components/docs/code-block';
import { InstallCommand } from '@/components/docs/install-command';
import { CopySkillButton } from '@/components/docs/copy-skill-button';
import { C, P } from '@/components/docs/page-shell';
import { Step, Steps } from '@/components/docs/steps';
import { getAgentSkill } from '@/lib/agent-skill';
import { docs, registryItemUrl, registryUrl, siteConfig } from '@/lib/site';

export default async function Home() {
  const skill = await getAgentSkill();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-16 px-5 py-16 md:py-20">
      <section className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Production dashboard primitives for shadcn/ui.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          Data tables, modals and sheets you install with the shadcn CLI and own outright. They build on stock shadcn/ui
          primitives, so they pick up your theme and work in any React framework.
        </p>
      </section>

      <section aria-labelledby="components" className="flex flex-col gap-4">
        <h2 id="components" className="text-muted-foreground text-sm font-medium">
          Components
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {docs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group hover:bg-muted/40 flex flex-col gap-3 rounded-xl border p-5 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{doc.title}</h3>
                <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 transition-[color,translate] group-hover:translate-x-0.5" />
              </div>
              <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{doc.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {doc.items.map((item) => (
                  <code key={item} className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                    {item}
                  </code>
                ))}
              </div>
            </Link>
          ))}
        </div>
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
            Give your coding agent the dentil skill, then ask it to add a data table, modals or sheets. Paste it into
            the chat, or save it as <C>.cursor/skills/dentil/SKILL.md</C> or <C>.claude/skills/dentil/SKILL.md</C> so
            the agent uses it whenever dentil comes up. Agents can also read it from <C>{siteConfig.url}/skill.md</C>.
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
            title="Add the registry to components.json"
            description="This lets the CLI resolve @dentil/* names. You can skip it and install by URL instead.">
            <CodeBlock lang="json" code={JSON.stringify({ registries: { '@dentil': registryUrl } }, null, 2)} />
          </Step>
          <Step
            title="Install a component"
            description="The CLI adds any stock shadcn/ui components it needs. Requires React 19 and Tailwind v4, with a Radix or Base UI style.">
            <InstallCommand title="By name" items={['@dentil/data-table']} />
            <InstallCommand title="By URL" items={[registryItemUrl('@dentil/data-table')]} />
          </Step>
          <Step title="Read the docs" description="Each page has setup steps, live examples and an API reference.">
            <div className="flex flex-wrap gap-2">
              {docs.map((doc) => (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium transition-colors">
                  {doc.title}
                </Link>
              ))}
            </div>
          </Step>
        </Steps>
      </section>
    </main>
  );
}
