const httpSignature = require('http-signature');

class HTTPSignatureVerifierService {
  constructor(settings = {}) {
      this.publicKey = null;
  }

  verify(request) {
      const parsedRequest = httpSignature.parseRequest(request);
      return httpSignature.verifySignature(parsedRequest, this.publicKey);
  }

  async static create(settings = {}) {
      const service = new HTTPSignatureVerifierService(settings);

      if (typeof settings.publicKeyProvider === 'function') {
          service.privateKey = await settings.publicKeyProvider();
      }
  }
}

module.exports = HTTPSignatureVerifierService;