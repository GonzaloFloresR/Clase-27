import { Router } from "express";
import ProductsController from "../controller/ProductsController.js";
import { uploader, generaProducts } from "../utils.js";
import auth from "../middleware/auth.js";

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