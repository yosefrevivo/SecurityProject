class CertificateRequest {
    constructor(subject, public_key, issuer, valid_from, valid_to) {
        this.subject = subject;
        this.public_key = public_key;
        this.issuer = issuer;
        this.valid_from = valid_from;
        this.valid_to = valid_to;
    }
}

module.exports = CertificateRequest;