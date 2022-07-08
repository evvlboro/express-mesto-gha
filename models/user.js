const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'Мининимальная длинна поля name карточки 2 символа'],
    maxlength: [30, 'Максимальная длинна поля name карточки 30 символа'],
    required: [true, 'Поле name является обязательным'],
  },
  about: {
    type: String,
    minlength: [2, 'Мининимальная длинна поля about карточки 2 символа'],
    maxlength: [30, 'Максимальная длинна поля about карточки 30 символа'],
    required: [true, 'Поле about является обязательным'],
  },
  avatar: {
    type: String,
    required: [true, 'Поле avatar является обязательным'],
  },
});

module.exports = mongoose.model('user', userSchema);
