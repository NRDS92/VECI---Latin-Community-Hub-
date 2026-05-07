export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  cityId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}