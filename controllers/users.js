const bcrypt = require('bcryptjs');
const validator = require('validator');
const DataNotFoundError = require('../errors/DataNotFoundError');
const User = require('../models/user');

const INCORRECT_DATA_ERROR_CODE = 400;
const DATA_NOT_FOUND_ERROR_CODE = 404;
const DEFAULT_ERROR_CODE = 500;
const SALT_ROUNDS = 10;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new DataNotFoundError('Переданы некорректные данные');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'DataNotFoundError') {
        res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!validator.isEmail(email)) {
    res.status(400).send({ message: 'Неверный email' });
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.status(409).send({ message: 'Пользователь с таким email уже существует.' });
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
    .catch(() => res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' }));
};

module.exports.updateProfile = (req, res) => {
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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateProfileAvatar = (req, res) => {
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
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      }
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};
