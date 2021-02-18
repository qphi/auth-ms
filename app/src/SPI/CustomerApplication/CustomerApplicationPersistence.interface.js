class CustomerApplicationPersistence {
    async create(settings) {}

    /** @param {String} api_key */
    async findByAPIKey(api_key) {}
    async findById(_id) {}
    async deleteById(_id) {}
    async updateById(_id, updates) {}
}

module.exports = CustomerApplicationPersistence;