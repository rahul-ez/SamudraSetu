const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function runPipeline(requirement) {
  const response = await fetch(`${API_BASE_URL}/api/v1/pipeline/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requirement),
  });

  if (!response.ok) {
    let message = `Pipeline request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.detail?.[0]?.msg || payload.detail || message;
    } catch {
      // Keep the normalized status message for non-JSON failures.
    }
    throw new Error(message);
  }
  return response.json();
}

