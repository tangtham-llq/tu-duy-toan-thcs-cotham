import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

type FeedbackStatus = 'understood' | 'needs_more' | 'too_hard';

const isValidStatus = (status: any): status is FeedbackStatus => {
  return ['understood', 'needs_more', 'too_hard'].includes(status);
};

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    try {
      const [understood, needs_more, too_hard] = await kv.mget<number[]>(
        'stats:understood',
        'stats:needs_more',
        'stats:too_hard'
      );
      return new Response(JSON.stringify({
        understood: understood ?? 0,
        needs_more: needs_more ?? 0,
        too_hard: too_hard ?? 0,
      }), {
        headers: { 
          'content-type': 'application/json',
          'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
         },
      });
    } catch (error) {
      console.error('KV GET Error:', error);
      return new Response(JSON.stringify({ error: 'Failed to retrieve stats' }), { status: 500 });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { status } = body as { status?: FeedbackStatus };

      if (!isValidStatus(status)) {
        return new Response(JSON.stringify({ error: 'Invalid feedback status' }), { status: 400 });
      }

      await kv.incr(`stats:${status}`);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
      });

    } catch (error) {
      console.error('KV POST Error:', error);
      return new Response(JSON.stringify({ error: 'Failed to record feedback' }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
