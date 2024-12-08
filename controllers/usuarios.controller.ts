import {Request,Response, NextFunction} from 'express';
import Usuario from '../models/usuario';
import fs from 'fs/promises';
import path from 'path'; 
import bcrypt from 'bcryptjs';
import {Op} from 'sequelize';
import getConnection from '../database/connectionQuery';
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../database/configJwt';



export const getUsuarios = async (req:Request,res:Response)=>{

    const usuarios = await Usuario.findAll({
        attributes:{exclude:['password']}
    });

    res.json(usuarios);

}

export const getUsuario = async (req:Request,res:Response)=>{

    const {id} = req.params;

    const usuario = await Usuario.findByPk(id, {
        attributes:{exclude:['password']}
    });

    res.json(usuario);

}

export const postUsuario = async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    
    try {
        
        const {body} = req;
        const {nombre, email, password} = body;

        if (!nombre || !email || !password) {

            res.status(400).json({message:'Los campos nombre, email y constraseña son obligatorios'});
            return;
            
        }

        const existeEmail = await Usuario.findOne({where:{email}});

        if (existeEmail) {

            if(req.file){

                await fs.unlink(path.resolve(req.file.path));
            }

            res.status(400).json({message:`El email ${email} ya esta registrado`});
            return;
            
        }

        if(req.file){

            body.imagen = req.file.filename;

        }else{

            body.imagen = null;

        }

        const salt = bcrypt.genSaltSync(10);
        body.password = bcrypt.hashSync(password, salt);

        const usuario = Usuario.build(body);
        await usuario.save();

     const {password:_, ...UsuarioSinPassword} = usuario.toJSON();
     res.status(201).json(UsuarioSinPassword); 

        
    } catch (error) {
        
        next(error);

    }

   

}

export const putUsuario = async(req:Request,res:Response):Promise<void>=>{

    const {id} = req.params;
    const body = req.body;

    try {

        const usuario = await Usuario.findByPk(id);
        const usuarioData = usuario?.toJSON();

        if(!usuario){
            res.status(404).json({message:'El usuario no existe'});
            return;
        }

        if (body.email) {

            const emailExistente = await Usuario.findOne({
                where:{email:body.email, id:{[Op.ne]:id}}
            });

           if(emailExistente){

            res.status(400).json({message:`El email ${body.email} ya esta registrado`});

            if (req.file) {

                await fs.unlink(path.resolve(req.file.path));
                
            }
            return;

           }
           
           if(req.file){

            const nuevaImagen = req.file.filename;

            if (usuarioData?.email) {

                const imagePath = path.resolve(`uploads/${usuarioData.imagen}`);

                try {
                    if (req.file) {
                        await fs.unlink(path.resolve(imagePath));                        
                    }
                } catch (error) {

                    console.error(`Error al eliminar la imagen anterior:${error}`);
                    
                }
                
            }

            body.imagen = nuevaImagen;

           }else{

            delete body.imagen;

           }
            
        }
    if(body.password){

        const salt = bcrypt.genSaltSync(10);
        body.password = bcrypt.hashSync(body.password,salt);

    }
    
    await usuario.update(body); 
    
    const {password:_, ...usuarioSinPassword} = usuario.toJSON();

    res.json(usuarioSinPassword);
        
    } catch (error) {

        console.error(error);
        res.status(500).json({message:'Error interno del servidor'});
        
    }   

}

export const deleteUsuario = async (req:Request,res:Response)=>{

    const {id} = req.params;

   try {

        const connection = await getConnection();

        const [rows] = await connection.query('SELECT * FROM usuarios WHERE id = ?',[id]);

        if ((rows as any).length === 0) {

            return res.status(404).json({message:'El usuario no se encuentra en la Base de Datos'});
            
        }

        const {imagen} = (rows as any)[0];

        await fs.unlink(path.resolve(`uploads/${imagen}`));
        console.log('Imagen eliminada del servidor');

        await connection.query('DELETE FROM usuarios WHERE id= ?',[id]);
        res.json({message:'El usuario se elimino correctamente'});


    
   } catch (error) {
    
    console.error(error);
    res.status(500).json({message:'Error interno del servidor'});

   }

}

export const login = async (req:Request, res:Response)=>{

    const {email, password} = req.body;

    try {

        const usuario = await Usuario.findOne({where:{email}});
        const usuarioData = usuario?.toJSON();

        if(!usuario){

            res.status(404).json({message:'Credenciales incorrecta'});

        }

        const validPassword = await bcrypt.compare(password, usuarioData.password);

        if(!validPassword){

            res.status(400).json({message:'Credenciales incorrectas '});

        }

        const token = jwt.sign({

            id: usuarioData.id,
            email: usuarioData.email,
            nombre: usuarioData.nombre,
            imagen: usuarioData.imagen,
            estado: usuarioData.estado

        },JWT_SECRET, {expiresIn:'24h'}
    
        );

        res.json(token);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Error interno del servidor'});
    }


}