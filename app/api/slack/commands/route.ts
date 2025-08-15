import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const command = String(form.get('command') || '');
  const text = String(form.get('text') || '');

  if (command === '/notes') {
    return NextResponse.json({ text: `Saved note: ${text}` });
  }
  if (command === '/ask') {
    return NextResponse.json({ text: `(stub) Answering: ${text}` });
  }
  if (command === '/retro') {
    return NextResponse.json({ text: 'Retro saved. Good work today!' });
  }
  return NextResponse.json({ text: 'Unknown command.' });
}