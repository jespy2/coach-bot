import { WebClient } from '@slack/web-api'; 

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function postMessage(channel: string, text: string) {
  const token = process.env.SLACK_BOT_TOKEN!;
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text }),
  });
  return res.json();
}

export async function postBlocks(channel: string, text: string, blocks: any[]) {
  const token = process.env.SLACK_BOT_TOKEN!;
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text, blocks }),
  });
  return res.json();
}