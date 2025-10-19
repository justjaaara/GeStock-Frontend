export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequestBackend {
  name: string;
  email: string;
  password: string;
}
export interface RegisterRequest extends RegisterRequestBackend {
  confirmPassword: string; // Interfaz del frontend
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
  message: string;
}