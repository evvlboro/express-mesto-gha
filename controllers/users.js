/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const validator = require('validator');
const DataNotFoundError = require('../errors/DataNotFoundError');
const ConflictError = require('../errors/ConflictError');
const User = require('../models/user');
const { getJwtToken } = require('../utils/jwt');

const INCORRECT_DATA_ERROR_CODE = 400;
const DEFAULT_ERROR_CODE = 500;
const SALT_ROUNDS = 10;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' }));
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new DataNotFoundError('Переданы некорректные данные');
      } else {
        res.send({ data: user });
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!validator.isEmail(email)) {
    res.status(400).send({ message: 'Неверный email' });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Пользователь с таким email уже существует.');
      }

      bcrypt.hash(password, SALT_ROUNDS)
        .then(
          (hash) => User.create({
            name, about, avatar, email, password: hash,
          })
            .then(((newUser) => res.status(201).send(newUser)))
            .catch((err) => {
              if (err.name === 'ValidationError') {
                res.status(INCORRECT_DATA_ERROR_CODE).send({
                  // тут поле err.errors.user при создании пользователя с about < 2 = undefind,
                  // поэтому как ниже не выйдет
                  // message: err.errors.user.message
                  message: 'Ошибка при создании пользователя. Не соблюдено одно из условий при его создании.',
                });
                return;
              }
              res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' });
            }),
        );
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.updateProfileAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: 'Неправильный логин или пароль' });
      }

      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          return res.status(401).send({ message: 'Неправильный логин или пароль' });
        }

        const token = getJwtToken(user._id);

        return res.status(200).send({ token });
      });
    })
    .catch(next);
};

module.exports.getMyUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch(next);
};
