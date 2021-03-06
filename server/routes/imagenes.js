const express = require('express');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//IMPORTAMOS LOS MIDDLEWARES DE VERIFICAR TOKEN
const { verificaToken } = require('../middlewares/autenticacion');
const { verificaTokenImg } = require('../middlewares/autenticacion');


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) res.sendFile(pathImg);
    else {
        let noImagePath = path.resolve(__dirname, `../assets/no-image.jpg`);
        res.sendFile(noImagePath);
    }
})



module.exports = app;