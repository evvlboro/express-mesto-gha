const router = require('express').Router();

const {
  getUsers, getUserById, getMyUser, updateProfile, updateProfileAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getMyUser);

router.get('/users/:userId', getUserById);

router.patch('/users/me', updateProfile);

router.patch('/users/me/avatar', updateProfileAvatar);

module.exports = router;
