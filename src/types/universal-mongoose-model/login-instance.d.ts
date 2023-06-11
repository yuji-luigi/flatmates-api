interface LoginInstance {
  email?: string | undefined;
  password: string;
  token(): () => string;
  passwordMatches: (password: string) => boolean;
  findAndGenerateToken: <T>(body: IUserDocument) => Promise<{
    user: T;
    accessToken: string;
  }>;
}
