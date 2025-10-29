// redirect to login if not logged in
const me = await fetch("/auth/me").then(r => r.ok ? r.json() : null).catch(()=>null);
// if (!me) location.href = "/login.html";

const form = document.getElementById("noteForm");
const input = document.getElementById("noteInput");
const list = document.getElementById("notes");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = localStorage.getItem("userEmail") || "";
const userId = localStorage.getItem("userId") || "";

async function loadNotes() {
  const url = userId ? `/notes?user_id=${encodeURIComponent(userId)}` : "/notes";
  const res = await fetch(url, { headers: userId ? { "x-user-id": userId } : {} });
  if (res.status === 401) return location.href = "/index.html";
  const notes = await res.json();
  const latest = Array.isArray(notes) && notes.length ? notes[0] : null;
  input.value = latest && latest.content ? latest.content : "";
  list.innerHTML = "";
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
  location.href = "/index.html";
};

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

await loadNotes();