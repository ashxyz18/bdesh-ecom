import * as SecureStore from "expo-secure-store";

export async function getSavedToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync("authToken");
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("authToken", token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync("authToken");
}
