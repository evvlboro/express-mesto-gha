const router = require('express').Router();
const {
  getUsers, getUserById, createUser, updateProfile, updateProfileAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/:userId', getUserById);

router.post('/users', createUser);

router.patch('/users/me', updateProfile);

router.patch('/users/me/avatar', updateProfileAvatar);

module.exports = router;
