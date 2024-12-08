import {DataTypes} from 'sequelize';
import db from '../database/connection';

const Usuario = db.define('Usuario',{

    nombre:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    imagen:{
        type:DataTypes.STRING,
        allowNull:true
    },
    estado:{
        type:DataTypes.BOOLEAN
    },

});

export default Usuario;