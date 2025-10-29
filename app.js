// redirect to login if not logged in
const me = await fetch("/auth/me").then(r => r.ok ? r.json() : null).catch(()=>null);
if (!me) location.href = "/login.html";

const form = document.getElementById("noteForm");
const input = document.getElementById("noteInput");
const list = document.getElementById("notes");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = localStorage.getItem("userEmail") || "";
const userId = localStorage.getItem("userId") || "";

async function loadNotes() {
  const url = userId ? `/notes?user_id=${encodeURIComponent(userId)}` : "/notes";
  const res = await fetch(url, { headers: userId ? { "x-user-id": userId } : {} });
  if (res.status === 401) return location.href = "/login.html";
  const notes = await res.json();
  list.innerHTML = "";
  notes.forEach(n => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <div class="meta">${new Date(n.created_at * 1000).toLocaleString()}</div>
      ${escapeHTML(n.content)}
    `;
    list.appendChild(div);
  });
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  await fetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Pass email via header for backend lookup
    ...(userEmail ? { headers: { "Content-Type": "application/json", "x-email": userEmail } } : {}),
    body: JSON.stringify({ content, ...(userEmail ? {} : { email: userEmail }) })
  });
  input.value = "";
  await loadNotes();
};

logoutBtn.onclick = async () => {
  await fetch("/auth/logout", { method: "POST" });
  location.href = "/login.html";
};

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

await loadNotes();