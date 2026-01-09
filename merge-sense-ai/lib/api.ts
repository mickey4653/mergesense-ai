// lib/api.ts
export async function resolveConflict(payload: {
    fileName: string;
    conflictText: string;
  }) {
    const res = await fetch("http://localhost:5678/webhook/git/conflict/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    const data = await res.json();
    return data[0];
  }
  