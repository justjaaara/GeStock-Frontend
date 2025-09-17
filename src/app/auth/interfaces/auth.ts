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

export interface RegisterResponse {
  status: number;
  description: string;
}
