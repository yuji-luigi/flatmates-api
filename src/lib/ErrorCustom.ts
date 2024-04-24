export class ErrorCustom extends Error {
  code: number;
  status: number;
  constructor(message: string, code = 500) {
    super(message);
    this.code = code;
    this.status = code;
  }
}
