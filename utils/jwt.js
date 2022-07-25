const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET } = process.env;

const getJwtToken = (id) => jwt.sign(
  { _id: id },
  JWT_SECRET,
  { expiresIn: '7d' }, // токен будет просрочен через час после создания
);

const isAuthoriset = (token) => jwt.verify(
  token,
  JWT_SECRET,
  (err, decoded) => {
    if (err) return false;

    return User.findById(decoded._id)
      .then((user) => Boolean(user));
  },
);
module.exports = {
  getJwtToken,
  isAuthoriset,
};
