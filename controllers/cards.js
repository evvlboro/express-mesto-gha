const Card = require('../models/card');
const DataNotFoundError = require('../errors/DataNotFoundError');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  const userId = req.user._id;
  Card.create({ name, link, owner: userId })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new DataNotFoundError('Запрашиваемая карточка не найдена');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'DataNotFoundError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new DataNotFoundError('Запрашиваемая карточка не найдена');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'DataNotFoundError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new DataNotFoundError('Запрашиваемая карточка не найдена');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'DataNotFoundError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};
