/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const DataNotFoundError = require('../errors/DataNotFoundError');
const WrongCredentialsError = require('../errors/WrongCredentialsError');
const User = require('../models/user');
const { getJwtToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
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

  bcrypt.hash(password, SALT_ROUNDS)
    .then(
      (hash) => User.create({
        name, about, avatar, email, password: hash,
      })
        .then(((newUser) => {
          const newUserWithoutPassword = {
            name: newUser.name,
            about: newUser.about,
            avatar: newUser.avatar,
            email: newUser.email,
            _id: newUser._id,
          };
          return res.status(201).send(newUserWithoutPassword);
        }
        ))
        .catch(next),
    );
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
        throw new WrongCredentialsError('Неправильный логин или пароль');
      }

      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          throw new WrongCredentialsError('Неправильный логин или пароль');
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
