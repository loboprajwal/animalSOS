import { QueryClient } from "@tanstack/react-query";

/**
 * Helper function to throw an error if response is not OK
 */
async function throwIfResNotOk(res) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.message || `API error: ${res.status}`);
    } else {
      const text = await res.text();
      throw new Error(text || `API error: ${res.status}`);
    }
  }
}

/**
 * Generic API request function for mutations
 */
export async function apiRequest(method, url, body = undefined) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

/**
 * Generate a query function with options for handling 401 responses
 */
export const getQueryFn = (options = { on401: "throw" }) => {
  return async ({ queryKey }) => {
    const [url] = queryKey;
    const res = await fetch(url, {
      credentials: "include",
    });

    if (res.status === 401 && options.on401 === "returnNull") {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };
};

/**
 * Create and configure the QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      queryFn: getQueryFn(),
    },
  },
});