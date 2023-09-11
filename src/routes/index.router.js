const express = require('express');
const router = express.Router();
const Producto = require('../models/products.models');
const { requireLogin } = require('../middleware/authMiddleware');
const { userModel } = require('../models/user.model');
const { getUserRoleFromDatabase } = require('../utils/function');

router.get('/', requireLogin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; //Obtengo el número de página de los parámetros de consulta
        const limit = 5; //Establece el límite de productos por página a 5

        const startIndex = (page - 1) * limit;

        const totalProducts = await Producto.countDocuments(); 

        const productos = await Producto.find()
            .skip(startIndex)
            .limit(limit);

        const userId = req.session.userId;
        const usuario = await userModel.findById(userId);
        const userRole = await getUserRoleFromDatabase(userId);

        let message = '';
        let isAdmin = false;

        if (userRole === 'admin') {
            message = '¡Bienvenido, administrador!';
            isAdmin = true;
        } else {
            message = '¡Bienvenido, usuario!';
        }

        //Calculo el número total de páginas en función del total de productos y el límite por página
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('home', {
            productos,
            nombreUsuario: usuario.nombre,
            Rol: userRole,
            isAdmin,
            pagination: {
                page,
                totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            }
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

module.exports = router;
