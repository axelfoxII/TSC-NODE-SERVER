import {Usuario} from './usuario';


declare global {
    namespace Express{
        interface Request {

            usuario?:{

                id:number,
                email:string,
                nombre:string,
                imagen:string | null,
                estado:string | null,

            }

        }        
    }
}