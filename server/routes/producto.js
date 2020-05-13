//IMPORTAMOS EL PAQUETE EXPRESS
const express = require('express');

//IMPORTAMOS EL MODELO CATEGORÍA
const Producto = require('../models/producto');

//IMPORTAMOS LOS MIDDLEWARES DE VERIFICAR TOKEN
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

const _ = require('underscore');


/**
 * OBTENER TODOS LOS PRODUCTOS
 */
app.get('/productos', verificaToken, (req, res) => {
    //Parámetros para paginar los resultados
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Obtenermos los productos
    Producto.find({ disponible: true /*Posibles condiciones*/ })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email') //Cargar información de tabla relacionada, solamente quiero nombre y email
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });

});

/**
 * OBTENER TODOS LOS PRODUCTOS
 */
app.get('/productos/:id', verificaToken, (req, res) => {
    //Trae un producto cargando el usuario y la categoría

    //Obtenermos los productos
    Producto.findById(req.params.id)
        .populate('usuario', 'nombre email') //Cargar información de tabla relacionada, solamente quiero nombre y email
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

/**
 * CREAR UN PRODUCTO
 */
app.post('/productos', verificaToken, (req, res) => {
    //Grabar el usurio
    //Grabar la categoria
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id //Lo cojo del token cuando hago login
    });


    //Guardamos el producto
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    });

});

/**
 * ACTUALIZAR UN PRODUCTO
 */
app.put('/productos/:id', verificaToken, (req, res) => {
    //Grabar el usurio
    //Grabar la categoria  

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.descripcion = body.descripcion;
        productoDB.precioUni = body.precioUni;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoGuardado
            });

        });

    });

});

/**
 * BORRAR UN PRODUCTO
 */
app.delete('/productos/:id', verificaToken, (req, res) => {
    //No borrar físicamente, disponible = false
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado'
        });
    });

});

/**
 * BUSCAR PRODUCTOS
 */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});


module.exports = app;