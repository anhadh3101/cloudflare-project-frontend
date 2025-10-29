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
  if (!content) {
    alert("Please enter some content before saving");
    return;
  }
  
  if (!userId) {
    alert("Error: User ID not found. Please log in again.");
    location.href = "/index.html";
    return;
  }

  try {
    const response = await fetch("https://aifit-db-2.anhadhsran3101.workers.dev/api/saveNotes", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        user_id: userId,
        content: content
      })
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      console.log("Notes saved successfully:", result);
      // Optional: Show success feedback
      // You can add a toast notification here if desired
    } else {
      const error = await response.text().catch(() => "Failed to save notes");
      alert(`Error saving notes: ${error}`);
    }
  } catch (error) {
    console.error("Error saving notes:", error);
    alert("Failed to save notes. Please try again.");
  }
};

logoutBtn.onclick = async () => {
  await fetch("/auth/logout", { method: "POST" });
  location.href = "/index.html";
};

// Trigger workflow to get AI response
async function callChatModel(message) {
  const workflowUrl = "https://weathered-wave-1a88.anhadhsran3101.workers.dev/";
  
  try {
    // Trigger workflow
    const response = await fetch(workflowUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        metadata: {},
        query: message
      })
    });
    
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const { id } = await response.json();
    
    // Wait for workflow to complete
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`${workflowUrl}?instanceId=${id}`);
      const status = await statusRes.json();
      if (status.details?.status === "complete") {
        return "AI response has been saved to your notes. Please refresh to see the update.";
      }
    }
    
    return "Request is processing. Your notes will be updated shortly.";
  } catch (error) {
    console.error("Error:", error);
    return `Error: Could not process your request. Please try again.`;
  }
}

// Function to send chat message
async function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Clear input
  chatInput.value = "";
  
  // Get AI response from workflow
  const response = await callChatModel(message);
  
  // Show response in textarea
  const currentContent = input.value.trim();
  const separator = currentContent ? "\n\n---\n\n" : "";
  input.value = currentContent + separator + "AI: " + response;
  
  // Scroll textarea to bottom
  input.scrollTop = input.scrollHeight;
  
  // Reload notes to get updated content from database after workflow completes
  setTimeout(() => {
    loadNotes();
    console.log("Notes refreshed after AI response");
  }, 2500);
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