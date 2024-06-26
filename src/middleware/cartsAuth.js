const cartsAuth = (req, res, next) => {
    console.log(req.originalUrl, "Desde auth linea 2")
    if(!req.session.usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"No existen usuarios autenticados"});
    }
    let usuario = req.session.usuario;

    if(usuario.rol === "admin"){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"El Administrador no puede comprar productos"});
    }
    
    next();
}

export default cartsAuth;