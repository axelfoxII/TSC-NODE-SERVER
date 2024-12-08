import {Request,Response, NextFunction} from 'express';
import jwt, {JwtPayload}  from 'jsonwebtoken';
import {JWT_SECRET} from '../database/configJwt';


export const verificarToken = async (req:Request, res:Response, next:NextFunction)=>{

    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        
        res.status(401).json({message:'No hay token, Autorización denegada'});

        return;

    }

    try {

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {id:number; email:string;};

        req.usuario = {

            id:decoded.id,
            email:decoded.email,
            nombre: '',
            imagen:null,
            estado:null
        };


        next();
        
    } catch (error) {

        res.status(401).json({message:'token invalido o expirado'});
        
    }


}