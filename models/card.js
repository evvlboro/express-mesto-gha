const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'Мининимальная длинна поля name карточки 2 символа'],
    maxlength: [30, 'Максимальная длинна поля name карточки 30 символа'],
    required: [true, 'Поле name является обязательным'],
  },
  link: {
    type: String,
    required: [true, 'Поле link является обязательным'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Поле owner является обязательным'],
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model('card', cardSchema);
