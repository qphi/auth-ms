class RefreshTokenService {
    constructor(context) {
        this.api = context.api.refreshRequestHelper // context.service.jwt
        this.service = context.services.jwt;
    }

    /**
     *
     * @param request
     * @returns {Promise<{ string: user_id, string: salt }>}
     */
    async getPayloadFromRequest(request) {
        return await this.service.verify(
            await this.api.getToken(request),
            this.api.getPublicKey(request)
        );
    }
}

module.exports = RefreshTokenService;