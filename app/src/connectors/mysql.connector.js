const Connector = require('./connector.model');
const mariadb = require('mariadb');

const uuid = require('uuid');
const UserAlreadyExistsException = require('../Exceptions/UserAlreadyExists.exception');
const cookieParser = require('cookie-parser');

class MySQLConnector extends Connector {
    constructor(settings = {}) {
        super(settings);

        this.pool = mariadb.createPool({
            database: process.env.DB_NAME,
            //port: process.env.DB_PORT || 3306,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionLimit: 5
        });

    }

    async getConnection() {
        return await this.pool.getConnection();
    }

    async record(service) {
        let connexion;
        try {
            connexion = await this.getConnection();
            //const query = `CREATE TABLE "${service.name}" (email char(64) not null unique, password char(64) not null, role varchar(10) not null, uuid char(36) primary key)`;
            const query = `CREATE TABLE ${service.name} (email char(64) not null unique, password char(64) not null, role varchar(10) not null, uuid char(36) primary key);`;
            console.log(query, service);
            const rows = await connexion.query(query,
            [
                service.name
            ]);
        }

        catch(error) {
            console.error(error);
        }

        finally {
            this.releaseConnexion(connexion);
        } 
    }

    async getUserUUID(email, service) {
        let uuid = null;
        let connexion;
        try {
            connexion = await this.getConnection();
            const rows = await connexion.query(`SELECT uuid FROM ${service.name} WHERE email = ?`, [
                email
            ]);

            if (rows && rows.length > 0) {
                uuid = rows[0] || null;
            }
        }

        catch(error) {
            console.error(error);
        }

        finally {
            this.releaseConnexion(connexion);
            return uuid;
        }
    }

    releaseConnexion(connexion) {
        if (connexion !== null) {
            connexion.release();
        }
    }

    /** @override */
    async findUser(email, password, service) {
        let user = null;
        let connexion;
        try {
            connexion = await this.getConnection();
            const rows = await connexion.query(`SELECT * FROM ${service.name} WHERE email = ? AND password = ?`, [
                email,
                password
            ]);

            if (rows && rows.length > 0) {
                user = rows[0] || null;
            }
        }

        catch(error) {
            console.error(error);
        }

        finally {
            this.releaseConnexion(connexion);

            return user;
        }
    }

    async createUser(userData, service) {
        let connexion;
        let customError = null;
        let _uuid = null;

        try {
            connexion = await this.getConnection();
            _uuid = uuid.v5(userData.email, service.MS_UUID); 

            const rows = await connexion.query(`
            INSERT INTO ${service.name} (email, password, role, uuid) VALUES (?, ?, ?, ?);
            `, [
                userData.email,
                userData.password,
                userData.role,
                _uuid
            ]);
        }

        catch(error) {
            console.error(error);

            if (error.code === 'ER_DUP_ENTRY') {
                customError = new UserAlreadyExistsException(error.message);
            }
        }

        finally {
            if (connexion !== null) {
                connexion.release();
            }

            if (customError !== null) {
                throw customError;
            }

            return _uuid;
        }
    }


    async updateUserPassword(uuid, newPassword, service) {
        let user = null;
        let connexion;
        try {
            connexion = await this.getConnection();
            const rows = await connexion.query(`UPDATE ${service.name} SET password = ? WHERE uuid = ?`, [
                newPassword,
                uuid
            ]);

            if (rows && rows.length > 0) {
                user = rows[0] || null;
            }
        }

        catch(error) {
            console.error(error);
        }

        finally {
            this.releaseConnexion(connexion);

            return user;
        }
    }
}

module.exports = MySQLConnector;