import multer from "multer";
import bcrypt from "bcrypt";
//import {fakerES_MX as faker} from "@faker-js/faker";

import {fileURLToPath} from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination:(request, file, cb) => {
        cb(null, __dirname+'/public/img');
    },
    filename:(request, file, cb) => {
        cb(null, file.originalname);
    }
});

export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validaPassword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash);

export const uploader = multer({storage: storage});

export const formatearMoneda = (valor) => {
    const opciones = {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0, // Opcional: para evitar decimales
    };
    const formatoMoneda = new Intl.NumberFormat('es-CL', opciones);
    return formatoMoneda.format(valor);
}

/* export const generaProducts = () => {
    let _id = faker.database.mongodbObjectId();
    let title = faker.commerce.productName();
    let description = faker.commerce.productDescription();
    let price = faker.commerce.price();
    let thumbnail = faker.image.urlPicsumPhotos();
    let code = faker.internet.password();
    let stock = faker.number.int({min:1, max:200});
    return {
        _id,
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
    }
} */

