const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

interface ApiError {
  message: string;
  status: number;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: errorBody.detail || errorBody.message || "Request failed",
      status: response.status,
    };
    throw error;
  }

  const data: T = await response.json();
  return { data, status: response.status, ok: true };
}

export function get<T>(path: string, headers?: Record<string, string>) {
  return request<T>("GET", path, undefined, headers);
}

export function post<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
) {
  return request<T>("POST", path, body, headers);
}

export function put<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
) {
  return request<T>("PUT", path, body, headers);
}

export function del<T>(path: string, headers?: Record<string, string>) {
  return request<T>("DELETE", path, undefined, headers);
}

export { BASE_URL };
export type { ApiResponse, ApiError };
