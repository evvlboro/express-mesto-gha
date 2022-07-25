module.exports = class WrongOwnerCardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongOwnerCardError';
    this.statusCode = 403;
  }
};
