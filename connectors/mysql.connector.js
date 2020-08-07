const Connector = require('./connector.model');
const mariadb = require('mariadb');

const uuid = require('uuid');

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
            if (connexion !== null) {
                connexion.release();
            }

            return user;
        }
    }

    async createUser(userData, service) {
        let user = null;
        let connexion;
        try {
            connexion = await this.getConnection();
            const _uuid = uuid.v5(userData.email, service.MS_UUID); 

            console.log('uuid', _uuid);
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
        }

        finally {
            if (connexion !== null) {
                connexion.release();
            }

            return user;
        }
    }
}

module.exports = MySQLConnector;