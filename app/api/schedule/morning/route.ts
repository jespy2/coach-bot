import { NextRequest, NextResponse } from 'next/server';
import { postMessage } from '@/lib/slack';
import { fetchTodayTasks } from '@/lib/linear';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SCHEDULE_TOKEN}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  console.log('Morning endpoint hit');
  const tasks = await fetchTodayTasks();
  const text = ['*Morning Plan*', ...tasks.map((t,i)=>`${i+1}. ${t}`)].join('\n');
  await postMessage(process.env.SLACK_DEFAULT_CHANNEL_ID || '', text);
  return NextResponse.json({ ok: true });
}