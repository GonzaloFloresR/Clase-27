import usuariosModelo from "./models/UsuarioModel.js";

class UsersMongoDAO {

    async createUsuario(usuario){
        let nuevoUsuario = await usuariosModelo.create(usuario);
        return nuevoUsuario.toJSON();
    }

    async getUsuarioBy(filtro={},proyeccion={}){
        return await usuariosModelo.findOne(filtro,proyeccion).lean();
    }


}

export default UsersMongoDAO;