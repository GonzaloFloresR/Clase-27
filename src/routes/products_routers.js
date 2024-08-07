const { Router } = require("express");
const router = Router();
const ProductsController = require("../controller/ProductsController.js");
const uploader = require("../utils.js").uploader;
const {isValidObjectId} = require("mongoose");
const auth = require("../middleware/auth.js");


const entorno = async () => {
    
    router.get("/", ProductsController.getProducts);

    router.get("/:pid", ProductsController.getProductByPID);
    
    router.post("/",uploader.single('thumbnail'), auth, ProductsController.createProduct );

    router.put("/", (req, res) => {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Debe ingresar el ID del producto a modificar`});
    });

    router.put("/:pid", auth, ProductsController.modifyProduct);

    router.delete("/", async(request, response) => {
        response.setHeader('Content-Type','application/json');
        return response.status(400).json({error:`Debe ingresar el ID del producto a eliminar`});
    });

    router.delete("/:pid", auth, ProductsController.deleteProduct);
    
}

entorno();

module.exports = router;