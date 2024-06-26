const auth = (req, res, next) => {
    console.log(req.originalUrl, "Desde auth linea 2")
    if(!req.session.usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"No existen usuarios autenticados"});
    }
    let usuario = req.session.usuario;
    let requestMethod = req.method;

    if(requestMethod === "GET"){
        next();
    }
    if (['POST', 'PUT', 'DELETE'].includes(requestMethod)){
        if(usuario.rol === "admin"){
            next();
        } else {
            // Denegar acceso si el usuario no tiene rol "admin"
            res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }
    }

    //next();
}

export default auth;