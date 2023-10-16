const async = require('hbs/lib/async');
const { userModel } = require('../models/user.model');
const bcrypt = require('bcryptjs');

//Renderizar la pagina de registro
function renderRegiserPage(req, res) {
    res.render('register');    
}

//Agregar un nuevo usuario
async function registerUser(req, res) {
    try {
        const { nombre, apellido, edad, email, pass } = req.body;

        //console.log('Nuevo intento de registro:', nombre, email);

        const usuarioExistente = await userModel.findOne({ email });
        if (usuarioExistente) {
            console.log('Usuario ya existe:', email);
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPass = await bcrypt.hash(pass, 10); //"10" es el número de rondas de encriptación

        const nuevoUsuario = new userModel({
            nombre,
            apellido, 
            edad,
            email,
            pass: hashedPass, // Guarda la contraseña encriptada
        });

        await nuevoUsuario.save();
        console.log('Usuario registrado con éxito:', email);

        // Redirigir al usuario a la página de inicio de sesión
        res.redirect('login'); 
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Renderizar la página de inicio de sesión
function renderLoginPage(req, res) {
    res.render('login');
}

//Iniciar sesión del usuario
async function loginUser(req, res) {
    try {
        const { email, pass } = req.body;

        const usuario = await userModel.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }

        // Compara la contraseña ingresada con la contraseña almacenada en la base de datos
        const isPasswordValid = await bcrypt.compare(pass, usuario.pass);
        if (!isPasswordValid) {
            return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
        }

        // Almaceno el ID del usuario en la sesión
        req.session.userId = usuario._id;

        res.redirect('/');

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Cerrar la sesión del usuario
function logoutUser(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
        }
        // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
        res.redirect('/login');
    });
}

module.exports = {
    renderRegiserPage, 
    registerUser, 
    renderLoginPage, 
    loginUser, 
    logoutUser,
};