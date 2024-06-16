import multer from "multer";
import bcrypt from "bcrypt";

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