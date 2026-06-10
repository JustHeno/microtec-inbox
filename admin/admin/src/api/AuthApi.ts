const API_URL = "http://localhost:8000";
const TOKEN_KEY = "microtec_admin_token";
const USER_KEY = "microtec_admin_user";

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  name: string;
  role: string;
};

export class AuthApi {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Identifiants invalides");
    }

    const data: LoginResponse = await res.json();

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        name: data.name,
        role: data.role,
      })
    );

    return data;
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static getUser(): { name: string; role: string } | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}