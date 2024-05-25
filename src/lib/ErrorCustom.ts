export class ErrorCustom extends Error {
  code: number;
  status: number;
  internalLog?: string;
  constructor(message: string, code = 500, internalLog?: string) {
    super(message);
    this.code = code;
    this.status = code;
    this.internalLog = internalLog;
  }
}
