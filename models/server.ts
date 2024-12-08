
import express, {Application} from 'express';
import userRoutes from '../routes/usuarios.routes';
import multer from 'multer';
import path from 'path';
import db from '../database/connection';

import cors from 'cors';

class Server{

    private app:Application;
    private port:string;
    private apiPaths ={
        usuarios:'/api/usuarios',
    }

    constructor(){

        this.app = express();
        this.port= process.env.PORT || '8000';
        this.dbConnection();
        this.middlewares();
        this.routes();

    }


    async dbConnection(){

        try {

            await db.authenticate();
            console.log('Database onLine...');
            
        } catch (error) {

            console.error(error);
            
        }

    }


    middlewares(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
        
        this.app.use((err:any, req:express.Request, res:express.Response, next:express.NextFunction)=>{
            
            if(err instanceof multer.MulterError){

                res.status(400).json({
                    error:err.message,
                });

            }else if(err){

                res.status(500).json({
                    error:err.message,
                });

            }else{
                next();
            }


        })


    }

    routes(){

        this.app.use(this.apiPaths.usuarios, userRoutes);

    }


    listen(){

        this.app.listen(this.port, ()=>{
            console.log(`Server is running on port ${this.port}`);
        });

    }

}

export default Server;