const cartsAuth = (req, res, next) => {
    if(!req.session.usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"No existen usuarios autenticados"});
    }
    let {cid} = req.params;
    let usuario = req.session.usuario;

    if(req.originalUrl == "/chat" && usuario.rol === "admin"){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"El Administrador no puede acceder al chat"});
    }

    if(cid && usuario.cart != cid){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"Solo puede agregar productos a su propio carrito"});
    }

    /* if(usuario.rol === "admin"){
        res.setHeader("Content-Type","application/json");
        return res.status(401).json({error:"El Administrador no puede comprar productos"});
    } */
    
    next();
}

export default cartsAuth;