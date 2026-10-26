import { ApiError } from "./http";

interface FirebaseAuthResponse {
  idToken: string;
  localId: string;
  error?: { message?: string };
}

export async function firebasePasswordRequest(
  operation: "signUp" | "signInWithPassword",
  email: string,
  password: string,
) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("FIREBASE_WEB_API_KEY belum dikonfigurasi.");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${operation}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
    },
  );
  const result = (await response.json()) as FirebaseAuthResponse;
  if (!response.ok || !result.idToken || !result.localId) {
    const code = result.error?.message;
    if (code === "EMAIL_EXISTS") throw new ApiError("Email sudah terdaftar.", 409);
    if (
      code === "INVALID_LOGIN_CREDENTIALS" ||
      code === "EMAIL_NOT_FOUND" ||
      code === "INVALID_PASSWORD"
    ) {
      throw new ApiError("Email atau kata sandi tidak cocok.", 401);
    }
    if (code === "WEAK_PASSWORD : Password should be at least 6 characters") {
      throw new ApiError("Kata sandi minimal 6 karakter.", 400);
    }
    throw new ApiError("Autentikasi Firebase gagal.", 401);
  }
  return result;
}
