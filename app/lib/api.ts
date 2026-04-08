import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Determine the API host based on platform
export function getApiHost(): string {
  // If running in Expo Go on a physical device, use the debugger host IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (Platform.OS === "web") {
    return "localhost";
  }
  if (Platform.OS === "android") {
    // Physical device gets debugger host, emulator uses 10.0.2.2
    return debuggerHost || "10.0.2.2";
  }
  // iOS simulator or physical
  return debuggerHost || "localhost";
}

const BASE_URL = `http://${getApiHost()}:8000/api`;

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync("token");
  } catch {
    // SecureStore not available on web — ignore
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadFile(
  uri: string,
  entityType: string,
  entityId: string,
  fileType: string = "photo",
  notes?: string,
): Promise<unknown> {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync("token");
  } catch {}

  const filename = uri.split("/").pop() || "photo.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    pdf: "application/pdf",
  };
  const mimeType = mimeMap[ext] || "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const params = new URLSearchParams({
    entity_type: entityType,
    entity_id: entityId,
    file_type: fileType,
  });
  if (notes) params.set("notes", notes);

  const response = await fetch(`${BASE_URL}/files?${params.toString()}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Upload error: ${response.status}`);
  }

  return response.json();
}

export default api;
