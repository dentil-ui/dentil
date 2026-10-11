import { getAgentSkill } from '@/lib/agent-skill';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(await getAgentSkill(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
