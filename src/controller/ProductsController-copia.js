import ProductDAO from "../dao/ProductsMongoDAO.js";
import { isValidObjectId } from "mongoose";

const productDAO =  new ProductDAO();

export default class ProductsController {

    static getProducts = async(request, response) => {
        let {limit, page, sort} = request.query;
        if(sort){
            sort = Number(sort); 
            if(isNaN(sort)){
                sort = 1;
            }
        } 
        if(page){
            page = Number(page); 
            if(isNaN(page)){
                page = 1;
            }
        } page = page || 1;
        if(limit){
            limit = Number(limit);
            if(!isNaN(limit)){
                if(limit > 0){
                    try {
                        let {docs:productos} = await productDAO.getProducts(limit, page, sort);
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json(productos);
                    } catch(error) {
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({
                                error:"Error inesperado en el servidor - intente más tarde",
                                detalle:`${error.message}`
                            });
                    }
                } 
            } else {
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:"Los limites deben ser datos numericos"});
            }
        } else { 
            limit=10
            try { 
                let {docs:productos} = await productDAO.getProducts(limit,page,sort);
                response.setHeader('Content-Type','application/json');
                return response.status(200).json(productos);
            } catch(error){ 
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
                
            }
        }
    }

    static getProductByPID = async(request, response) => {
        let {pid} = request.params;
        if(!isValidObjectId(pid)){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({erro:'Ingrese un ID valido de MongoDB'})
        } else {
            try {
                let producto = await productDAO.getProductBy({_id:pid});
                if(producto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json(producto);
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe producto con ID ${pid}`});
                }
            }
            catch(error){
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json(
                    {
                        error:`Error inesperado en el servidor`,
                        detalle:`${error.message}`
                    }
                );
            }
        }
    }

    static createProduct = async(request, response) => {
        //Recuperar todos los datos desde el cuerpo de la consulta
        let {title,description,price,thumbnail,code,stock} = request.body;
        //Verificar Si recibimos imagenenes
        if (request.file){
            thumbnail = request.file.path;
        }
        let existe;
        if(!title || !description || !price || !code || !stock){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json(
                {error:"valores requeridos title, description, price, code, stock"}
            );
        } else {
            code = code.trim();
            try { 
                existe = await productDAO.getProductBy({code:code});
            }
            catch(error) {
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json(
                    {
                        error:`Error inesperado en el servidor`,
                        detalle:`${error.message}`
                    }
                );
            }   
            if(!existe){ 
                if (thumbnail){
                    thumbnail = "../"+(thumbnail.split("public/")[1]);
                }  
                let nuevoProducto = {
                    title:title,
                    description:description,
                    price:price,
                    thumbnail:thumbnail || "../img/SinImagen.png",
                    code:code,
                    stock:stock
                };
                
                let agregado
                try {
                    agregado = await productDAO.addProduct(nuevoProducto);
                } catch(error) {
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                };
                
                if(agregado){
                    
                    let productos;
                    try {
                        productos = await productDAO.getProductBy({_id:agregado._id});
                        request.io.emit("NuevoProducto", productos);
                        response.setHeader('Content-Type','application/json');
                        return response.status(201).json({payload:agregado}); 
                    } 
                    catch(error) { 
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    }
                } else { //Cerrando si se agrego
                    response.setHeader('Content-Type','application/json');
                    response.status(400).json({status:"error", message:"El producto no se pudo agregar"});
                }
            } else { //Si se encuentra el "code" en la Base de datos
                response.setHeader('Content-Type','application/json');
                response.status(400).json(
                    {   
                        status:"error",
                        message:`Codigo Repetido ${code}`
                    }
                );
            } 
        } 
    }

    static modifyProduct = async(request, response) => {
        
        let {pid} = request.params;
            let producto;
            if(!isValidObjectId(pid)){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:"Ingrese un ID Valido para MongoDB"});
            } else {
                try {
                    producto = await productDAO.getProductBy({_id:pid});
                } catch(error){
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                }
                if(producto){
                    let modificado;
                    let modificaciones = request.body;
                    console.log(modificaciones);
                    if(modificaciones._id){
                        
                        delete modificaciones._id; 
                    }
                    if(modificaciones.code){
                        try {
                            let existe = await productDAO.getProductBy({_id:{$ne:pid},code:modificaciones.code});
                            if(existe){
                                response.setHeader('Content-Type','application/json');
                                return response.status(400).json({error:`Ya existe un producto con el code ${modificaciones.code}`});
                            }
                        }
                        catch(error){
                            console.log(error);
                            response.setHeader('Content-Type','application/json');
                            return response.status(500).json(
                                {
                                    error:`Error inesperado en el servidor`,
                                    detalle:`${error.message}`
                                }
                            );
                        }
                    }
                    try {
                        modificado = await productDAO.updateProduct(pid, modificaciones);
                    } catch(error){
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    } if(modificado){
                        request.io.emit("ProductoActualizado", modificado);
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json({modificado});
                    } else {
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({status:"error", message:`No se pudo modificar ID ${pid}`});
                    }
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe un producto con el ID ${pid}`});
                }
            }
    }

    static deleteProduct = async(request, response) => {
        let pid = request.params.pid;

            if(!isValidObjectId(pid)){
                response.setHeader('Content-Type','application/json');
                response.status(400).json({error:"Ingrese un ID Mongo"});
            } else {
                let producto;
                try {
                    producto = await productDAO.getProductBy({_id:pid});
                } catch(error){
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                }
                if(producto){
                    let borrado;
                    try {
                        borrado = await productDAO.deleteProduct({_id:pid});
                    } catch(error){
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    }
                    if(borrado){
                        request.io.emit("ProductoEliminado", pid);
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json({status:"succes", message:`Producto con ID ${pid} Eliminado ✅`});
                    } else {
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({error:`Error al intentar elimimnar el producto ${pid}`});
                    }
                } else { //Si el producto no existe
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe producto con el ID ${pid}`});
                }
            }
    }
}