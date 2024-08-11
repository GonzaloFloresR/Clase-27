import mongoose, { isValidObjectId } from "mongoose";
import {afterEach, before, describe, it} from "mocha";
import supertest from "supertest-session";
import {expect} from "chai";
import fs from "fs";
import { __dirname } from "../../src/utils.js";


const connDB = async() => {
    try {
        await mongoose.connect(
            "mongodb+srv://gonzalof:Coder098@cluster0.pt1wq7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            dbName: "ecommerce"
        }
        );
        console.log("DB conectada...!!!");
    } catch (error) {
        console.log(`Error al conectar a DB: ${error}`);
    }
}

connDB();

const requester =  supertest("http://localhost:8080");

describe("Pruebas Proyecto ECommerce", function(){
    this.timeout(10000);

    
    describe("Pruebas Router de Products", function(){
        

        beforeEach(async function(){
            this.timeout(10000);
            let {body} =  await requester.post("/api/sessions/login")
                                        .send({"usuario":"gonzalof@hotmail.com","password":"1234"});
                                        console.log("Usuario Conectado!!!")
        });

        after(async function(){
            this.timeout(10000);
            await mongoose.connection.collection("products").deleteMany({code:"FriedCakes"});
            fs.unlinkSync(`${__dirname}/public/img/TortaFritas.jpeg`);
        })

        it("Producto Router Products en su método GET devuelve un Array de Productos", async function(){
            let {body, status, ok, headers } =  await requester.get("/api/products/");
            if(status == 200 && ok === true){
                expect(Array.isArray(body)).to.be.true;
                expect(body.length).to.be.equal(10);
                if(Array.isArray(body) && body.length>0){
                    expect(body[0]._id).to.exist;
                    expect(body[0].title).to.exist;
                }
            }
        });

        it("El Router Products en su método GET:PID devuelve un Objeto de Producto", async function(){
            this.timeout(10000);

            let productoTest = await mongoose.connection.collection("products").findOne();

            if(isValidObjectId(productoTest._id)){
                let pid = productoTest._id;
                let {body, status, ok } =  await requester.get(`/api/products/${pid}`);
                if(status == 200 && ok === true){
                    expect(typeof body === "object").to.be.true;
                    expect(isValidObjectId(body._id)).to.be.true;
                    expect(body.title).to.exist;
                }
            }
        });
        
        let IDProducto;
        it("El Router Products en su método POST crea un Producto con Imagen", async function(){
            this.timeout(10000);

            let mockProducts = {
                title: "Tortas Fritas",
                description: "Las Mejores Tortas Fritas de Argentina",
                price: 2500,
                thumbnail: "./test/routes/TortaFritas.jpeg",
                code: "FriedCakes",
                stock: 20,
            }

            let {body,ok} = await requester.post("/api/products/")
                                                    .field("title", mockProducts.title)
                                                    .field("description", mockProducts.description)
                                                    .field("price", mockProducts.price)
                                                    .field("code", mockProducts.code)
                                                    .field("stock", mockProducts.stock)
                                                    .attach("thumbnail",mockProducts.thumbnail)
            expect(ok).to.be.true;
            expect(body.payload).to.exist;
            expect(fs.existsSync(`${__dirname}/public/img/TortaFritas.jpeg`)).to.be.true
            expect(body.payload._id).to.exist;
            IDProducto = body.payload._id;
        });

        it(`El Router Products en su método PUT, modifica el producto`, async function(){
            this.timeout(15000);

            let mockProduct = {
                "title": "12 Tortas Fritas",
                "description": "Las Mejores Tortas Fritas",
                "price": 2500,
                "stock": 10
            }
            
            let {body, ok} = await requester.put(`/api/products/${IDProducto}`)
                                            .send(mockProduct); 
            
            expect(ok).to.be.true;
            expect(body.modificado).to.exist;
            expect(body.modificado.title).to.be.equal("12 Tortas Fritas")
            expect(body.modificado._id).to.be.equal(IDProducto);
        });

    })// Cerrando Prueba Productos

    

}) // Cerrando Prueba General 