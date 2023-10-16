const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// //Ruta GET para renderizar la pagina register
router.get('/register', usersController.renderRegiserPage);

//Ruta POST para agregar un usuario
router.post('/register', usersController.registerUser);

//Ruta GET para obtener la pagina de login
router.get('/login', usersController.renderLoginPage);

//Ruta POST para iniciar sesión del usuario
router.post('/login', usersController.loginUser);

//Ruta para cerrar sesión
router.get('/logout', usersController.logoutUser);

module.exports = router;