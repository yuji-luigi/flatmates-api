// Constructor
export function CustomError(code: string, message: string, error: string) {
  // always initialize all instance properties
  this.success = false;
  this.error = {
    code,
    message,
    ref: error
  }; // default value
}

// class methods
// CustomError.prototype.error = function () {};
// export the class
module.exports = CustomError;
