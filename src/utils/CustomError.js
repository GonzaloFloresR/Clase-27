export class customError{
    static createrError(name = "Error", cause, message, code){
        const error = new Error(message, {cause: cause});
        error.name = name;
        error.code = code;

        throw error;
    }
}