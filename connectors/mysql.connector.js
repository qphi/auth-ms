const Connector = require('./connector.model');
const mariadb = require('mariadb');

const uuid = require('uuid');
const UserAlreadyExistsException = require('../src/Exceptions/UserAlreadyExists.exception');
const cookieParser = require('cookie-parser');

class MySQLConnector extends Connector {
    constructor(settings = {}) {
        super(settings);

        this.pool = mariadb.createPool({
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionLimit: 5
        });

    }

    async getConnection() {
        return await this.pool.getConnection();
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
}

module.exports = MySQLConnector;