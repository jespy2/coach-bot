import { WebClient } from '@slack/web-api';
export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
export async function postMessage(channel: string, text: string) {
  if (!channel) throw new Error('SLACK_DEFAULT_CHANNEL_ID missing');
  return slack.chat.postMessage({ channel, text });
}