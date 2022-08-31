import {MockRootCertificate} from "./MockCertificateChain.js";

export class Entity {
    constructor() {
        this.root_certificates = [MockRootCertificate];
    }

    getSignatureVerifyResult = (signature, pem) => {

        let publicKey = pem.toString('ascii')
        const verifier = crypto.createVerify('RSA-SHA256')

        verifier.update(signature, 'ascii')

        const publicKeyBuf = new Buffer(publicKey, 'ascii')
        const signatureBuf = new Buffer(signature, 'hex')
        return verifier.verify(publicKeyBuf, signatureBuf);
    }

    isValidCertificate(certificates_chain) {
        // Extract first certificate from the certificates chain and convert to Certificate object
        let first_certificate = new Certificate(certificates_chain[0]);
        // Check if root_certificate is in this.root_certificates
        if (!this.root_certificates.includes(first_certificate.issuer)) {
            console.log("Unknown root certificate issuer");
            return false;
        }

        // Check if the certificate is expired - i.e. valid_to is in the past
        first_certificate.valid_to = new Date(first_certificate.valid_to);
        if (first_certificate.valid_to < new Date()) {
            console.log("Certificate is expired");
            return false;
        }

        let certificate_issuer = first_certificate;
        // Check all certificates in the certificates chain
        for (let i = 1; i < certificates_chain.length; i++) {
            let certificate = new Certificate(certificates_chain[i]);
            // Check if the certificate is expired - i.e. valid_to is in the past
            certificate.valid_to = new Date(certificate.valid_to);
            if (certificate.valid_to < new Date()) {
                console.log("Certificate is expired");
                return false;
            }

            // Check if the certificate is issued by the issuer of the previous certificate.
            let isValidSignature = this.getSignatureVerifyResult(certificate.signature, certificate_issuer.public_key)
            if (!isValidSignature) {
                console.log("Invalid signature");
                return false;
            }

            certificate_issuer = certificate;
        }

        return true;
    }
}