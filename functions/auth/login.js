export const onRequestPost = async ({ request }) => {
    // The URL of your API Worker (replace this with your deployed Worker endpoint)
    const API_URL = "https://aifit-db-2.anhadhsran3101.workers.dev/api/getUser";
  
    // Forward the request to the Worker
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(), // pass through the JSON body
    });
  
    // Return the Worker's response to the frontend
    return new Response(await res.text(), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  };

