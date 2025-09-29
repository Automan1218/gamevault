// API 封装
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
  email: string;
}

export class AuthApi {
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.message || "登录失败");
    }
    // 存储 token
    localStorage.setItem("auth_token", result.token);
    return result;
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.message || "注册失败");
    }
    // 存储 token
    localStorage.setItem("auth_token", result.token);
    return result;
  }

  static async requestPasswordReset(email: string): Promise<void> {
    // 模拟密码重置请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 实际实现中应该调用后端 API
    console.log('Password reset requested for:', email);
  }
}
