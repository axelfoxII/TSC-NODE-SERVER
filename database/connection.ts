import {Sequelize} from 'sequelize';

const db = new Sequelize('node_curso','root','',{
    host: 'localhost',
    dialect: 'mysql',
});

export default db;