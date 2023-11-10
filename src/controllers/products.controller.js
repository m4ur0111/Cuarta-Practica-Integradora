const productDao = require('../dao/products.dao');
const Producto = require('../models/products.models');
const errorHandlers = require('../services/errors/errorHandler');

//Ruta GET para obtener los productos con variables
async function getProducts(req, res) {
    try {
        const { limit = 10, page = 1, sort, query, minPrice, maxPrice } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort === 'desc' ? { precio: -1 } : sort === 'asc' ? { precio: 1 } : null,
        };

        const queryOptions = {};
        
        if (query) {
            queryOptions.categoria = query;
        }

        if (minPrice) {
            queryOptions.precio = { $gte: parseFloat(minPrice) };
        }

        if (maxPrice) {
            queryOptions.precio = { ...queryOptions.precio, $lte: parseFloat(maxPrice) };
        }

        const result = await Producto.paginate(queryOptions, options);

        res.render('products', { productos: result.docs, pagination: result });
        } catch (error) {
        req.logger.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Ruta GET para la página de agregar producto
function renderAddProductPage(req, res) {
    res.render('add-product');
}

//Ruta POST para agregar un nuevo producto
async function addProduct(req, res) {
    try {
        const nuevoProducto = req.body;

        //Verifica si el producto se creó con éxito
        const productoCreado = await productDao.createProduct(nuevoProducto);

        if (!productoCreado) {
            errorHandlers.customErrorHandler('productoNoCreado', res); //Manejo de error personalizado
        } else {
            res.status(201).json({ mensaje: 'Producto creado con éxito' });
        }
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
        errorHandlers.customErrorHandler('errorServidor', res);
    }
}

//Ruta GET para mostrar la vista de edición de productos
async function renderEditProductPage(req, res) {
    try {
        const productId = req.params.id;
        const producto = await productDao.findProductById(productId);

        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('edit-product', { producto });
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Ruta POST para procesar la edición de un producto
async function editProduct(req, res) {
    try {
        const productId = req.params.id;
        const updatedProductData = req.body;

        const productoActualizado = await productDao.updateProduct(productId, updatedProductData);

        if (!productoActualizado) {
            errorHandlers.customErrorHandler('productoNoActualizado', res); //Manejo de error personalizado
        } else {
            //Producto actualizado con éxito
            res.redirect(`/product/edit/${productoActualizado._id}`);
        }
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
        errorHandlers.customErrorHandler('errorServidor', res); //Manejo de error personalizado
    }
}

//Ruta para ver los detalles de un producto
async function viewProductDetails(req, res) {
    const productId = req.params._id;

    const product = await Producto.findById(productId);

    if (!product) {
        //Maneja el caso en el que el producto no se encuentra
        return res.status(404).render('404');
    }

    //Establece la cookie con la categoría del producto visitado
    res.cookie('selectedCategory', product.categoria, { maxAge: 1800000 }); //30 minutos de duración

    //Renderiza la página de detalle de producto y pasa los datos del producto
    res.render('product-detail', { product });
}

module.exports = {
    getProducts,
    renderAddProductPage,
    addProduct,
    renderEditProductPage,
    editProduct,
    viewProductDetails,
};
