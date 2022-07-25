const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'Мининимальная длинна поля name карточки 2 символа'],
    maxlength: [30, 'Максимальная длинна поля name карточки 30 символа'],
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: [2, 'Мининимальная длинна поля about карточки 2 символа'],
    maxlength: [30, 'Максимальная длинна поля about карточки 30 символа'],
    required: [true, 'Поле about является обязательным'],
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

module.exports = mongoose.model('user', userSchema);
