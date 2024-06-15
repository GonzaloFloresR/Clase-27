const passport = require("passport");
const local = require("passport-local");
const GitHub = require("passport-github2");
const UsersDAO = require("../dao/UsersMongoDAO.js");
const CartsDAO = require("../dao/CartsMongoDAO.js");
const {generaHash, validaPassword} = require("../utils.js"); 

const cartsDAO = new CartsDAO();
const usersDAO = new UsersDAO();

const initPassport = () => {
    
    passport.use(
        "github",
        new GitHub.Strategy(
            {
                clientID:"Iv23liK3HzRiINoNgoC7",
                clientSecret:"73c63df9be3b7f02010a523cafa995cebb8d4ec8",
                callbackURL:"http://localhost:8080/api/sessions/callbackGithub"
            },
            async(tokenAcceso, tokenRefresh, profile, done) => {
                try { 
                    
                    let email = profile._json.email;
                    let nombre = profile._json.name;
                    if(!email){
                        return done(nullm, false);
                    }
                    let usuario = await usersDAO.getUsuarioBy({email});
                    if(!usuario){
                        let cart = await cartsDAO.crearCarrito();
                        usuario = await usersDAO.createUsuario({
                            first_name:nombre, email, cart, profile
                        });
                    }
                    return done(null, usuario);

                } 
                catch(error){
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField:"email",
                passReqToCallback: true
            },
            async(req, username, password, done) => {
                try { 
                    
                    let {nombre:first_name, apellido:last_name, edad:age, rol} = req.body;
                    if(!first_name){
                        return done(null, false);
                    }
                    
                    let emailCheck = await usersDAO.getUsuarioBy({email: username});
                    if(emailCheck){
                        return done(null, false);
                    }
                    
                    let cart = await cartsDAO.crearCarrito();
                    password = generaHash(password);
                    let usuario = {first_name,last_name,age, email:username, password, rol, cart};
                    let nuevoUsuario = await usersDAO.createUsuario(usuario);
                    if(nuevoUsuario){
                        nuevoUsuario = {...nuevoUsuario}
                        delete nuevoUsuario.password;
                        return done(null, nuevoUsuario);
                    }
                    
                } 
                catch(error){
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField:"usuario"
            },
            async(username, password, done) => {
                try { 
                        existeUsuario = await usersDAO.getUsuarioBy({"email":username});
                        if (!existeUsuario){
                            return done(null, false);
                        } else {
                            if(!validaPassword(password, existeUsuario.password)){
                                return done(null, false);
                            }
                            return done(null, existeUsuario);
                        }
                        
                    } 
                    catch(error){
                        return done(error);
                    }
            })
    );

    
    passport.serializeUser((usuario, done) => {
        return done(null, usuario._id)
    });

    passport.deserializeUser(async(id,done) => {
        let usuario = await usersDAO.getUsuarioBy({_id:id});
        return done(null, usuario)
    });

}

module.exports = initPassport;