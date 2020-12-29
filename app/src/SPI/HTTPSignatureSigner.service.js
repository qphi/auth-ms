const httpSignature = require('http-signature');

class HTTPSignatureSignerService {
  constructor(settings = {}) {
      this.privateKey = null;
      this.keyName = settings.keyName || 'unknown';
      this.secret = null;

      this.headers = settings.headers || [];
      this.signPayload = typeof settings.signPayload === 'undefined' ? true : settings.signPayload;

      this.signer = httpSignature;
      this.options = {
          key: this.privateKey,
          keyId: this.keyName
      };

      if (typeof this.secret === 'string') {
          this.options.keyPassphrase = this.secret;
      }
  }

  sign(request) {
      this.signer(request, this.options);
  }

  async static create(settings = {}) {
      const service = new HTTPSignatureSignerService(settings);

      if (typeof settings.privateKeyProvider === 'function') {
          service.privateKey = await settings.privateKeyProvider();
      }
  }
}

module.exports = HTTPSignatureSignerService;