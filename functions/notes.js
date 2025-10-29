export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const headerEmail = request.headers.get("x-email")?.trim();
  const email = headerEmail || url.searchParams.get("email")?.trim();
  const ensure = (url.searchParams.get("ensure") || "").toLowerCase() === "true";

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const API_BASE = "https://aifit-db-2.anhadhsran3101.workers.dev";

  // 1) Lookup user to get user_id
  const userRes = await fetch(`${API_BASE}/api/getUser?email=${encodeURIComponent(email)}`);
  if (!userRes.ok) {
    return new Response(await userRes.text(), { status: userRes.status, headers: { "Content-Type": "application/json" } });
  }
  const users = await userRes.json();
  const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) Fetch notes by user_id
  const notesRes = await fetch(`${API_BASE}/api/getNotes?user_id=${encodeURIComponent(user.id)}`);
  if (!notesRes.ok) {
    return new Response(await notesRes.text(), { status: notesRes.status, headers: { "Content-Type": "application/json" } });
  }
  let notes = await notesRes.json();

  // 3) Optionally ensure an initial note exists
  if (ensure && Array.isArray(notes) && notes.length === 0) {
    const createRes = await fetch(`${API_BASE}/api/storeNotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, content: "Welcome to your notes!" })
    });
    if (!createRes.ok) {
      return new Response(await createRes.text(), { status: createRes.status, headers: { "Content-Type": "application/json" } });
    }
    // Re-fetch notes after creating the initial one
    const refetch = await fetch(`${API_BASE}/api/getNotes?user_id=${encodeURIComponent(user.id)}`);
    notes = await refetch.json();
  }

  return new Response(JSON.stringify(notes), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost = async ({ request }) => {
  const headerEmail = request.headers.get("x-email")?.trim();
  const { email: bodyEmail, content } = await request.json().catch(() => ({}));
  const email = headerEmail || (bodyEmail || "").trim();

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!content || typeof content !== "string") {
    return new Response(JSON.stringify({ error: "Missing content" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const API_BASE = "https://aifit-db-2.anhadhsran3101.workers.dev";

  // 1) Lookup user to get user_id
  const userRes = await fetch(`${API_BASE}/api/getUser?email=${encodeURIComponent(email)}`);
  if (!userRes.ok) {
    return new Response(await userRes.text(), { status: userRes.status, headers: { "Content-Type": "application/json" } });
  }
  const users = await userRes.json();
  const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) Create note using user_id
  const createRes = await fetch(`${API_BASE}/api/storeNotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, content })
  });

  return new Response(await createRes.text(), {
    status: createRes.status,
    headers: { "Content-Type": "application/json" },
  });
};


