const jwt = require('jsonwebtoken');

/*
    VERIFICAR TOKEN

*/

let verificaToken = (req, res, next) => {

    let token = req.get('token'); // recibo el token desde el header
    jwt.verify(token, process.env.SEMILLA, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'TOKEN no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next(); // Si no se ejecuta next, terminará la llamada y no continuará

    });



};

/*
    VERIFICAR TOKEN

*/
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }


};


/*
    VERIFICAR TOKEN IMG

*/
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEMILLA, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'TOKEN no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next(); // Si no se ejecuta next, terminará la llamada y no continuará

    });

};


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}