export const onRequestPost = async ({ request }) => {
  // Parse the request body
  const { email, password } = await request.json();
  
  // The URL of your API Worker
  const API_URL = "https://aifit-db-2.anhadhsran3101.workers.dev/api/storeUser";

  // Forward the request to the Worker
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // Return the Worker's response to the frontend
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};

