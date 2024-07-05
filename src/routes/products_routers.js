import { Router } from "express";
import ProductsController from "../controller/ProductsController.js";
import { uploader, generaProducts } from "../utils.js";
import auth from "../middleware/auth.js";
import { customError } from "../utils/CustomError.js";
import { argumentosProducts } from "../utils/erroresProducts.js";

const router = Router();

const entorno = async () => {

    router.get("/mockingproducts",(req, res) => {
        
        let product = [];
        for(let i = 0; i < 100; i++){
            
            let element = generaProducts();
            product.push(element); 
        }

        res.setHeader("Content-Type","application/json");
        return res.status(200).json({status:"succes", payload: product});
    });

    router.post("/mockingproducts", (req, res) => {
        let {title, description, price, code, stock } = req.body;
        if(!title){
            customError.createrError("Argumento title faltante", argumentosProducts(req.body), "Complete la propiedad title");
        }
        if(price){
            customError.createrError("Argumento price faltante", argumentosProducts(req.body), "Complete la  propiedad price");
        }

        let producto = {title, description, price, code, stock };
        res.setHeader("Content-Type","application/json");
        return res.status(200).json({status:"succes", payload: producto});
        
    })
    
    router.get("/",ProductsController.getProducts);

    router.get("/:pid", ProductsController.getProductByPID);
    
    router.post("/",uploader.single('thumbnail'), auth, ProductsController.createProduct );

    router.put("/", auth,(req, res) => {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Debe ingresar el ID del producto a modificar`});
    });

    router.put("/:pid", auth, ProductsController.modifyProduct);

    router.delete("/", auth, async(request, response) => {
        response.setHeader('Content-Type','application/json');
        return response.status(400).json({error:`Debe ingresar el ID del producto a eliminar`});
    });

    router.delete("/:pid", auth, ProductsController.deleteProduct);

}

entorno();

export default router;