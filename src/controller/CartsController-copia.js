//import CartsDAO from "../dao/CartsMongoDAO.js";
import { cartsService } from "../repository/cartsService.js";
import { productsService } from "../repository/productsService.js"
//import ProductDAO from "../dao/ProductsMongoDAO.js";
import { isValidObjectId } from "mongoose";

//const cartsDAO = new CartsDAO();
//const productDAO =  new ProductDAO();

export default class CartsController {
    static purchase = async (req, res) => {
        let {cid} = req.params;
        let carrito = await cartsService.getCartsById_NotPopulate(cid);
        res.setHeader("Content-type","application/json")
        res.status(200).json({cid:carrito})
        
    }

    static getCart = async (request, response) => {
        try {
            let carrito = await cartsService.getCarts();
            if(carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(200).json(carrito);
            } else {
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`No hay carritos activos ❌`});
            }
        }
        catch(error){
            console.log(error);
            response.setHeader('Content-Type','application/json');
            return response.status(500).json({
                error:"Error inesperado en el servidor - intente más tarde",
                detalle:`${error.message}`});
            
        } 
    }

    static getCartById = async(request, response) => {
        let {cid} = request.params;
        
        if(!isValidObjectId(cid)){
            response.setHeader('Content-Type','application/json');
            return response.json({error:"Ingrese un ID Valido de Mongo"});
        } else {
            try {
                let carrito = await cartsService.getCartByID_Populate(cid);
                if(carrito){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json(carrito.products);
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe carrito con el ID ${cid}`});
                }
            }
            catch(error){
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
            } 
        }
    }

    static createCart = async(request, response) => {
        let {products} = request.body; 
        if(!products){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({status:"error", error:"Debe Agregar productos al carrito"});
        }

        try {
            let agregado = await cartsService.createNewCart({products});
            if(agregado){
                response.setHeader('Content-Type','application/json');
                return response.status(201).json(agregado);
            } else {
                response.setHeader('Content-Type','application/json');
                response.status(400).json({status:"error", message:"El producto no se pudo agregar"})
            }
        } 
        catch(error){
            console.log(error);
            response.setHeader('Content-Type','application/json');
            return response.status(500).json({
                error:"Error inesperado en el servidor - intente más tarde",
                detalle:`${error.message}`});
        }
        
    }

    static modifyProductById = async(request, response) => {
        let products = request.body;
        let {cid} = request.params;  //[{productId:"x",quantity:1},{productId:"y",quantity:1},{productId:"z",quantity:1}]
        if(!products){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({status:"error", error:"Debe Agregar productos al carrito"});
        }
        if(!isValidObjectId(cid)){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({status:"error", error:"Debe ingresar un Id Mongo Valido"});
        }
        // crear Array de pid´s recibidos para agregar
        let pids = products.map(produ => produ.productId);
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
        }
        catch(error){console.log(error.message)}
        
        const ArrayCarrito = carrito.products; 

        const productosPreExistentes = pids.filter(pidElement => {
            return ArrayCarrito.some(produ => produ.productId._id == pidElement);
        }); 

        if(productosPreExistentes == 0){
            try {
                let ProductosNormalizados = [];
                for (const produ of products) {
                    let produActual = await productsService.getProductBy({"_id": produ.productId}); 

                    quantity = produ.quantity;
                    ProductosNormalizados.push({"productId": produActual, "quantity": quantity});
                }
                let Updated = [...ArrayCarrito, ...ProductosNormalizados];                
                let resuelto = await cartsService.updateCart(cid,{$set:{"products":Updated}});
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({status:"Productos Agregados"});
                } else {
                    response.setHeader('Content-Type','application/json');
                    response.status(400).json({status:"error", message:"El producto no se pudo agregar"})
                }    
            } catch(error){console.log(error);}            
        } else {
            console.log(ArrayCarrito," ArrayCarrito Desde 137");//Carrito en BD
            for (const compra of products) {
                const index = ArrayCarrito.findIndex(producto => compra.productId == producto.productId._id);
                if (index !== -1) {
                    // Producto encontrado, actualizamos la cantidad
                    ArrayCarrito[index].quantity += compra.quantity;
                } else {
                    // Producto no encontrado, lo agregamos al carrito
                    ArrayCarrito.push(compra);
                }
            }
            try {
                let resuelto = await cartsService.updateCart(cid,{$set:{"products":ArrayCarrito}});
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({succes:"Productos agregado con existo"});
                }
            }
            catch(error){error.message}
        }
        response.setHeader('Content-Type','application/json');
        return response.status(400).json({error:"No se logro agregar los productos"});
    }

    static modifyCartProducsById = async(request, response) => {
        let {cid,pid }= request.params
        let {cantidad} = request.body; //No tiene de donde salir por ahora
        
        if(!cantidad || typeof cantidad != Number){
            cantidad = 1;
        }
        
        if(!isValidObjectId(cid) || !isValidObjectId(pid) ){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Ingrese un ID de Carrito y ID de Producto validos"});
        } 
        
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
            if(!carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El carrito con ID: ${cid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        let producto;
        try {
            producto = await productsService.getProductBy({_id:pid});
            if(!producto){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El producto con ID: ${pid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }

        const ProductoEnCarrito = carrito.products.find(produ => produ.productId._id == pid);
        if(ProductoEnCarrito){
            
            try {
                await productsService.updateProduct(pid, {"$inc":{"stock":-cantidad}});  
                ProductoEnCarrito.quantity += cantidad;
            }
            catch(error){error.message} 
            
        } else {
            carrito.products.push({"productId": pid, "quantity":cantidad});
        }
            try {
                let resuelto = await cartsService.updateCart(cid, carrito);
                if(resuelto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({status:"succes", message:`Producto ${pid} Agregado en carrito ${cid} `});
                }
            }
            catch(error){
                error.message
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({status:"error", message:`Producto ${pid} no se logro agregar en carrito ${cid}`});
            }
    }

    static deleteProductById = async(req, res) => {
        let {cid} = req.params;
        if(isValidObjectId(cid)){
            try {
                let Eliminado = await cartsService.deleteCart(cid);
                if(Eliminado){
                    res.setHeader('Content-Type','application/json');
                    return res.status(200).json({status:"succes", Eliminado});
                } else {
                    res.setHeader('Content-Type','application/json');
                    return res.status(400).json({erro:`No existe carrito con ID ${cid}`});
                }
            }
            catch(error){
                console.log(error);
            }
        }
    }

    static deleteProductFromCart = async(request, response) => {
        let {cid,pid }= request.params
        let cantidad = request.body;
        if(!cantidad || typeof cantidad != Number){
            cantidad = 1;
        }
        
        if(!isValidObjectId(cid) || !isValidObjectId(pid) ){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:"Ingrese un ID de Carrito y ID de Producto validos"});
        } 
        let carrito;
        try {
            carrito = await cartsService.getCartByID_Populate(cid);
            if(!carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El carrito con ID: ${cid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        let producto;
        try {
            producto = await productsService.getProductBy({_id:pid});
            if(!producto){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`El producto con ID: ${pid} no existe`});
            }
        }
        catch(error) {
            console.log(error.message)
        }
        
        const ProductoEnCarrito = carrito.products.find(produ => produ.productId._id == pid);
        if(ProductoEnCarrito){
            
            if(ProductoEnCarrito.quantity > 1){
                try {
                    await productsService.updateProduct(pid, {"$inc":{"stock":cantidad}});
                    ProductoEnCarrito.quantity -= cantidad;
                }
                catch(error){error.message}
            } else {
                carrito.products = carrito.products.filter(produ => produ.productId._id != pid);
            }
                try {
                    let resuelto = await cartsService.updateCart(cid, carrito);
                    if(resuelto){
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json({status:"succes", message:`Producto ${pid} Eliminado en carrito ${cid}`});
                    }
                }
                catch(error){
                    error.message
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({status:"error", message:`Producto ${pid} no se logro agregar en carrito ${cid}`});
                }
        }
    }
}
