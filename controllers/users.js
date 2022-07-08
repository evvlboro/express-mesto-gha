const DataNotFoundError = require('../errors/DataNotFoundError');

const User = require('../models/user');

const INCORRECT_DATA_ERROR_CODE = 400;
const DATA_NOT_FOUND_ERROR_CODE = 404;
const DEFAULT_ERROR_CODE = 500;

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
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: err.errors.name.message });
        return;
      }
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
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
      // if (!name && !about) {
      //   throw new ValidationError('Переданы некорректные данные');
      // }
      // if (name) {
      //   if (name.length < 2 || name.length > 30) {
      //     throw new ValidationError('Переданы некорректные данные');
      //   }
      // }
      // if (about) {
      //   if (about.length < 2 || about.length > 30) {
      //     throw new ValidationError('Переданы некорректные данные');
      //   }
      // }
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
