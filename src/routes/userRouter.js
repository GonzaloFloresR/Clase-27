import { Router } from "express";
import { isValidObjectId } from "mongoose";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";

const userDAO = new UsersMongoDAO();

const router = Router();

router.get("/", (req, res)=>{
    res.setHeader("Content-Type","application/json");
    return res.status(400).json({"status":`Error, Debe ingresar un Id de usuario válido`});
});

router.get("/:uid",async(req, res)=>{
    const {uid} = req.params;
    if(!isValidObjectId(uid)){
        res.setHeader("Content-Type","application/json");
        return res.status(400).json({"status":"Error, Debe ingresar un Id de usuario válido"});
    }
    try {
        const usuario = await userDAO.getUsuarioBy({"_id":uid});
        let actualizar;
        if(!usuario){
            res.setHeader("Content-Type","application/json");
            return res.status(400).json({"status":`Error, No existe usuario con el ID ${uid}`});
        }
        if(usuario.rol === "user"){
            usuario.rol = "premium";
            actualizar = await userDAO.updateUsuario(uid,usuario);
            if(!actualizar){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"status":`Error, No se pudo actualizar el usuario`});
            }
            res.setHeader("Content-Type","application/json");
            return res.status(200).json({"status":`Rol del usuario ${usuario.first_name} ${usuario.last_name} actualizado por ${usuario.rol}`});
        } else if(usuario.rol === "premium"){
            usuario.rol = "user";
            actualizar = await userDAO.updateUsuario(uid,usuario);
            if(!actualizar){
                res.setHeader("Content-Type","application/json");
                return res.status(400).json({"status":`Error, No se pudo actualizar el usuario`});
            }
            res.setHeader("Content-Type","application/json");
            return res.status(200).json({"status":`Rol del usuario ${usuario.first_name} ${usuario.last_name} actualizado por ${usuario.rol}`});
        } else {
            let rol = usuario.rol;
            res.setHeader("Content-Type","application/json");
            return res.status(400).json({"status":`Error, El rol de este usuario es ${rol} y no es modificable`});
        }

    }
    catch(error){
        console.log(error);
        res.setHeader("Content-Type","application/json");
        return res.status(400).json({"status":"Error inesperado en el servidor"});
    }
    
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({"status":uid})
});

export default router;