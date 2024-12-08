
import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

dotenv.config();

let mysqlConnection:mysql.Connection | undefined;

const getConnection = async ():Promise<mysql.Connection>=>{

    try {

        if (!mysqlConnection) {

            mysqlConnection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password:process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                multipleStatements:true
            });

            console.log('Conexion establecida correctamente');
            
        }

        return mysqlConnection;
        
    } catch (error) {

        console.error(error);
        throw error;
        
    }

}

export default getConnection;