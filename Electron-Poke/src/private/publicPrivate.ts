import * as crypto from 'crypto';
import { Symmetric } from './symmetric';

export class PublicPrivate {
    private static ECDH_ALGORITHM = 'secp256k1';

    public static getKeys() {
        let ecdh = crypto.createECDH(PublicPrivate.ECDH_ALGORITHM);
        let publicKey = ecdh.generateKeys('hex');
        let privateKey = ecdh.getPrivateKey('hex');
        return [publicKey, privateKey];
    }

    public static computeSecret(privateKey: string, otherPublicKey: string) {
        let ecdh = crypto.createECDH(PublicPrivate.ECDH_ALGORITHM);
        ecdh.setPrivateKey(privateKey, 'hex');
        let computedSecret = ecdh.computeSecret(otherPublicKey, 'hex', 'hex');
        let pbkdf2 = crypto.pbkdf2Sync(computedSecret, 'salt', 10000, 512, 'sha512');
        return pbkdf2.toString('hex');
    }

    public static decryptWithSecret(encryptedString: string, secret: string) {
        let decrypted = Symmetric.decrypt(encryptedString, secret);
        return decrypted;
    }
}