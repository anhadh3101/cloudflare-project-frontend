// redirect to login if not logged in
const me = await fetch("/auth/me").then(r => r.ok ? r.json() : null).catch(()=>null);
// if (!me) location.href = "/login.html";

const form = document.getElementById("noteForm");
const input = document.getElementById("noteInput");
const list = document.getElementById("notes");
const logoutBtn = document.getElementById("logoutBtn");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
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

// Dummy chat model implementation
async function callChatModel(message) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Dummy response - replace this with actual API call later
  const responses = [
    `Here's a helpful response to: "${message}". This is a placeholder response that will be replaced with actual AI model integration.`,
    `Based on your question about "${message}", here's some information you might find useful. Remember to replace this with a real AI call.`,
    `I understand you're asking about "${message}". This is a dummy implementation. The actual AI response will go here.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Function to send chat message
async function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Clear input
  chatInput.value = "";
  
  // Get AI response
  const response = await callChatModel(message);
  
  // Append AI response to textarea content
  const currentContent = input.value.trim();
  const separator = currentContent ? "\n\n---\n\n" : "";
  input.value = currentContent + separator + "AI: " + response;
  
  // Scroll textarea to bottom
  input.scrollTop = input.scrollHeight;
}

// Handle chat input Enter key
chatInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    await sendChatMessage();
  }
});

// Handle send button click
sendChatBtn.onclick = async () => {
  await sendChatMessage();
};

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

await loadNotes();