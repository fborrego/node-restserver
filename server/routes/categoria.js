//IMPORTAMOS EL PAQUETE EXPRESS
const express = require('express');

//IMPORTAMOS EL MODELO CATEGORÍA
const Categoria = require('../models/categoria');

//IMPORTAMOS LOS MIDDLEWARES DE VERIFICAR TOKEN Y VERIFICAR QUE ES UN USUARIO ADMINISTRADOR
const { verificaToken } = require('../middlewares/autenticacion');
const { verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

const _ = require('underscore');

/**
 * OBTENER TODAS LAS CATEGORÍAS
 */
app.get('/categoria', verificaToken, (req, res) => {
    //Parámetros para paginar los resultados
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Buscamos las categorias, en este caso no ponemos condición porque queremos obtener todas las categorias
    Categoria.find({ /*Posibles condiciones*/ })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email') //Cargar información de tabla relacionada, solamente quiero nombre y email
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Contamos el número de categorías
            Categoria.count({ /*posibles condiciones*/ }, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    numCategorias: conteo
                })
            })
        });
});

/**
 * OBTENER UNA CATEGORÍA POR ID
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    //Buscamos las categorias, en este caso no ponemos condición porque queremos obtener todas las categorias
    Categoria.findById(req.params.id)
        .exec((err, categoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!categoria) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categoria
            });
        });
});

/**
 * CREAR NUEVA CATEGORÍA
 */
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    //Guardar la nueva categoría
    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })

    });
});

/**
 * ACTUALIZAR NUEVA CATEGORÍA POR ID
 */
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']); //campos que sí se pueden actualizar

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});

/**
 * ACTUALIZAR NUEVA CATEGORÍA POR ID
 */
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    //Eliminación física
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (categoriaBorrada === null) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'Categoría borrada'
        })
    });
});




module.exports = app;