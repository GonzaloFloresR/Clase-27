import { Router } from "express";
import CartsController from "../controller/CartsController.js";
import auth from "../middleware/auth.js";

const router = Router();

const entorno = async() => { 
    
    router.get("/", CartsController.getCart );

    router.get("/:cid", CartsController.getCartById );

    router.post("/", CartsController.createCart );

    router.put("/:cid", CartsController.modifyProductById );

    router.put("/:cid/products/:pid", auth, CartsController.modifyCartProducsById );

    router.delete("/", (req, res) => {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({status:"error", message:"Debe ingresar un ID de Carrito Para eliminar"});
    });

    router.delete("/:cid", CartsController.deleteProductById );

    router.delete("/:cid/products/:pid", CartsController.deleteProductFromCart );

} 

entorno();

export default router;