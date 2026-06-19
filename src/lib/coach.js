import { SUPABASE_FUNCTION_URL, SUPABASE_ANON_KEY } from './supabase';

// Calls the `poker-coach` Supabase Edge Function, which proxies the request to
// an LLM (keeping the model provider's API key server-side). Returns the
// assistant's reply as a plain string.
export async function askCoach(systemPrompt, messages) {
  const response = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || 'Something went wrong.';
}
