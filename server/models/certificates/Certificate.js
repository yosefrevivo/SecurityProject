export class Certificate {
    constructor(subject, public_key, issuer, signature, valid_from, _valid_to) {
        this.subject = subject;
        this.public_key = public_key;
        this.issuer = issuer;
        this.signature = signature;
        this.valid_from = valid_from;
        this._valid_to = _valid_to;
    }

    get getDataForSigning() {
        return Buffer.from(JSON.stringify(
            {
                subject: this.subject,
                public_key: this.public_key,
                issuer: this.issuer,
                valid_from: this.valid_from,
                valid_to: this._valid_to
            }, "utf8"));
    }
}

