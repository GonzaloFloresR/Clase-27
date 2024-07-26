import { Router } from "express";
import UsersMongoDAO from "../dao/UsersMongoDAO.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { enviarMail } from "../utils.js"

const userDAO = new UsersMongoDAO();
const router = Router();

router.post("/", async (req, res)=>{
    let {email} = req.body;
    if(!email){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":"Debe ingresar un correo eléctronico"});
    }
    let usuario;
    try{ usuario = await userDAO.getUsuarioBy({email});
    }
    catch(error){console.log(error)}
    if(!usuario){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":`No existen usuarios con ese correo electrónico :${email}`});
    }
    let SECRET = config.GITHUB_CLIENT_SECRET;
    let token = jwt.sign({email},SECRET, {expiresIn:"1h"});
    let mensaje = ` <h1>Restablecer Contraseña</h1>
                    <p>Si usted no ha solicitado restabler su contraseña, elimine este correo</p>
                    <h2>Si necesita restablecer la contraseña siga el siguiente link</h2>
                    <a href="http://localhost:8080/resetpassword/ok/?token=${token}">Restablecer contraseña</a>
                    <p>¡Este link expirara en 1 hora!</p>`;
    let enviado = await enviarMail(email,"Restablecer Contraseña", mensaje );
    
    if(!enviado){
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({"respuesta":`No se logró enviar el correo electronico`});
    }
    
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({"respuesta":`Recibira un correo en el Email :${email}`});
});

router.get("/ok", (req, res)=>{
    let {token} = req.query;
    let SECRET = config.GITHUB_CLIENT_SECRET;

    try {
    const decodedToken = jwt.verify(token, SECRET);
    console.log(decodedToken, "Linea 48 de router.get(OK)");
    res.setHeader("Content-Type","text/html");
    return res.status(200).send(`
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña</title>
</head>
<body>
    <h1>Restablecer Contraseña</h1>
    <form id="resetPass">
        <input type="password" id="password" placeholder="password" required/>
        <button type="submit">Cambiár contraseña</button>
    </form>
</body>

<script>
    document.getElementById('resetPass').addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional
        let password = document.getElementById('password').value;
        let respuesta;
        try {
            respuesta = await fetch("http://localhost:8080/resetpassword/", {
            method: "PUT",
            body: JSON.stringify({password}),
            headers: {"Content-type": "application/json; charset=UTF-8"}
        });
        if(respuesta.ok){
            let mensaje = await respuesta.json();
        } else {
            console.error('Error en la respuesta:', response.status);
        }
    }
    catch(error){console.log(error)}
        
    });
</script>
</html>
        `);
    // El token es válido
    } catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(303).redirect("http://localhost:8080/recuperar.html");
    } else {
        console.log(error.message)
    }
    }

});

export default router;