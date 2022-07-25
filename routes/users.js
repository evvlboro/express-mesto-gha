const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUserById, getMyUser, updateProfile, updateProfileAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getMyUser);

router.get(
  '/users/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().alphanum().length(24),
    }),
  }),
  getUserById,
);

router.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateProfile,
);

router.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string(),
    }),
  }),
  updateProfileAvatar,
);

module.exports = router;
