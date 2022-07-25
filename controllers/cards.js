/* eslint-disable no-unreachable */
const Card = require('../models/card');
const DataNotFoundError = require('../errors/DataNotFoundError');
const WrongOwnerCardError = require('../errors/WrongOwnerCardError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  const userId = req.user._id;
  Card.create({ name, link, owner: userId })
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new DataNotFoundError('Запрашиваемая карточка не найдена');
      } if (req.user._id !== card.owner.toString()) {
        throw new WrongOwnerCardError('Вы не можете удалять чужие карточки');
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then((cardForRemove) => {
          res.send({ data: cardForRemove });
        })
        .catch(next);
    })
    .catch(next);
  // Card.findByIdAndRemove(req.params.cardId)
  //   .then((card) => {
  //     if (!card) {
  //       throw new DataNotFoundError('Запрашиваемая карточка не найдена');
  //     } if (req.user._id !== card.owner.toString()) {
  //       throw new WrongOwnerCardError('Вы не можете удалять чужие карточки');
  //     }
  //     res.send({ data: card });
  //   })
  //   .catch(next);
};

module.exports.likeCard = (req, res, next) => {
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
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
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
    .catch(next);
};
