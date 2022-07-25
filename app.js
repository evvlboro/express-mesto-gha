/* eslint-disable no-useless-escape */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const INCORRECT_DATA_ERROR_CODE = 400;

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

const {
  createUser, login,
} = require('./controllers/users');

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(/^https?:\/\/(www\.)?[\w\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]*#?$/),
    }),
  }),
  createUser,
);

app.use(require('./middlewares/auth')); // защита авторизации
app.use(require('./routes/users'));
app.use(require('./routes/cards'));

app.use((req, res) => {
  res.status(404).send({ message: 'Неверный url' });
});

app.use(errors()); // обработчик ошибок celebrate

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  if (err.name === 'CastError') {
    res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Запрашиваемый пользователь/карточка не найден/а' });
    return;
  }
  if (err.name === 'ValidationError') {
    res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные' });
    return;
  }
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
