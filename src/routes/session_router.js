import { Router } from "express";
import passport from "passport";
import  auth from "../middleware/auth.js";

const router = Router();

router.get("/error",(req, res) => {
    res.setHeader("Content-Type","application/json");
    return res.status(500).json({error:"Fallos al autenticar"});
});

router.get("/github", passport.authenticate("github",{}),(req, res) => {
});

router.get("/callbackGithub", passport.authenticate("github",{failureRedirect:"/api/sessions/error"}),(req, res) => {
    req.session.usuario = req.user;
    return res.status(200).redirect("/products");
});

router.post("/registro", passport.authenticate("registro",{failureRedirect:"/api/sessions/error"}), async (req, res) => {
    res.setHeader("Content-Type","application/json");
    return res.status(201).redirect("/login");
});

router.post("/login", passport.authenticate("login",{failureRedirect:"/api/sessions/error"}), async(req, res) => {
    let usuario = {...req.user};
    delete usuario.password;
    delete usuario.createdAt;
    delete usuario.updatedAt;
    req.session.usuario = usuario;
    return res.status(200).redirect("/products");
});

router.get("/logout",(req, res) => {
    req.session.destroy(error => {
        if(error){console.log(error);
            res.setHeader("Content-Type","application/json");
            return res.status(500).json({error:"Error inesperado en el servidor", detalle:`${error.message}`});
        }
    })
    return res.status(200).redirect("/login");
});

router.get("/current", auth,(req, res)=>{
    let usuario = req.session.usuario;
    res.setHeader("Content-Type","application/json");
    return res.status(200).json({login:usuario});
});

router.get("*", (req, res) => {
    res.setHeader("Content-Type","application/json");
    res.status(404).json({error:"Recurso no Encontrato"});
})

export default router;
