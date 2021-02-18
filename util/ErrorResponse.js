class ErrorResponse extends Error {
  constructor(message, statusCode, opcode) {
    super(message); // super constructor<Error> with the message
    this.statusCode = statusCode;
    this.opcode = opcode;
  }
}

module.exports = ErrorResponse;
