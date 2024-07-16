import { Router} from "express";
//import { generaProducts } from "../utils.js";
import MockingController from "../controller/mockingController.js";

const router = Router();

const entorno = async() => {
    
    router.get("/", MockingController.getProducts);
    
    
    router.post("/", (req, res) => {
        let {title, description, price, code, stock } = req.body;
        if(!title){
            CustomError.createrError("Argumento title faltante", argumentosProducts(req.body), "Complete la propiedad title", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
        if(!price){
            CustomError.createrError("Argumento price faltante", argumentosProducts(req.body), "Complete la  propiedad price", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
        let producto = {title, description, price, code, stock };
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({status:"succes", payload: producto});
        
    });
}

entorno();


export default router;