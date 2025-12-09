export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  exp: number;
}

export interface AuthState {
  accessToken: string;
  refreshToken?: string;
  payload: JwtPayload;
}
