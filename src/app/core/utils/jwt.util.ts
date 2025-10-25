export interface DecodedToken {
  sub: number;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export class JwtUtil {
  /**
   * Decodifica el payload de un JWT sin verificar la firma
   * @param token - Token JWT completo
   * @returns El payload decodificado o null si hay error
   */
  static decode(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        console.error('Token JWT inválido: debe tener 3 partes');
        return null;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando token JWT:', error);
      return null;
    }
  }

  /**
   * Verifica si el token JWT ha expirado
   * @param token - Token JWT completo o payload decodificado
   * @returns true si el token ha expirado, false en caso contrario
   */
  static isExpired(token: string | DecodedToken): boolean {
    const decoded = typeof token === 'string' ? this.decode(token) : token;

    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp viene en segundos, Date.now() en milisegundos
    const expirationDate = decoded.exp * 1000;
    const now = Date.now();

    return expirationDate < now;
  }

  /**
   * Obtiene el tiempo restante hasta que expire el token en milisegundos
   * @param token - Token JWT completo
   * @returns Milisegundos hasta la expiración, 0 si ya expiró, -1 si hay error
   */
  static getTimeUntilExpiration(token: string): number {
    const decoded = this.decode(token);

    if (!decoded || !decoded.exp) {
      return -1;
    }

    const expirationDate = decoded.exp * 1000;
    const now = Date.now();
    const timeLeft = expirationDate - now;

    return timeLeft > 0 ? timeLeft : 0;
  }

  /**
   * Obtiene un claim específico del token
   * @param token - Token JWT completo
   * @param claim - Nombre del claim a extraer
   * @returns El valor del claim o null si no existe
   */
  static getClaim<T = any>(token: string, claim: keyof DecodedToken): T | null {
    const decoded = this.decode(token);

    if (!decoded) {
      return null;
    }

    return (decoded[claim] as T) || null;
  }

  /**
   * Extrae el ID del usuario del token
   * @param token - Token JWT completo
   * @returns El ID del usuario o null si no existe
   */
  static getUserId(token: string): number | null {
    return this.getClaim<number>(token, 'sub');
  }

  /**
   * Extrae el nombre del usuario del token
   * @param token - Token JWT completo
   * @returns El nombre del usuario o null si no existe
   */
  static getUserName(token: string): string | null {
    return this.getClaim<string>(token, 'name');
  }

  /**
   * Extrae el email del usuario del token
   * @param token - Token JWT completo
   * @returns El email del usuario o null si no existe
   */
  static getUserEmail(token: string): string | null {
    return this.getClaim<string>(token, 'email');
  }

  /**
   * Extrae el rol del usuario del token
   * @param token - Token JWT completo
   * @returns El rol del usuario o null si no existe
   */
  static getUserRole(token: string): string | null {
    return this.getClaim<string>(token, 'role');
  }

  /**
   * Verifica si el token es válido (existe y no ha expirado)
   * @param token - Token JWT completo o null
   * @returns true si el token es válido, false en caso contrario
   */
  static isValid(token: string | null): boolean {
    if (!token) return false;
    return !this.isExpired(token);
  }
}
