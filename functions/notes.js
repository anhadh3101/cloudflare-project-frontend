export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const headerUserId = request.headers.get("x-user-id")?.trim();
  const userId = headerUserId || url.searchParams.get("user_id")?.trim();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing user_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const API_BASE = "https://aifit-db-2.anhadhsran3101.workers.dev";

  // 1) Fetch notes by user_id
  const notesRes = await fetch(`${API_BASE}/api/getNotes?user_id=${encodeURIComponent(userId)}`);
  if (!notesRes.ok) {
    return new Response(await notesRes.text(), { status: notesRes.status, headers: { "Content-Type": "application/json" } });
  }
  let notes = await notesRes.json();

  // 2) If no notes, create a default one and refetch
  if (Array.isArray(notes) && notes.length === 0) {
    const createRes = await fetch(`${API_BASE}/api/storeNotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, content: "Welcome to your notes!" })
    });
    if (!createRes.ok) {
      return new Response(await createRes.text(), { status: createRes.status, headers: { "Content-Type": "application/json" } });
    }
    const refetch = await fetch(`${API_BASE}/api/getNotes?user_id=${encodeURIComponent(userId)}`);
    notes = await refetch.json();
  }

  return new Response(JSON.stringify(notes), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
