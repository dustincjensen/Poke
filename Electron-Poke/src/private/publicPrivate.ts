import * as crypto from 'crypto';
import * as nodeRsa from 'node-rsa';
import { Symmetric } from './symmetric';

export class PublicPrivate {
    private static ECDH_ALGORITHM = 'secp256k1';

    public static getKeys() {
        let newKey = new nodeRsa();
        newKey.generateKeyPair();
        let publicKey = newKey.exportKey('components-public');
        let privateKey = newKey.exportKey('components-private');
        return [publicKey, privateKey];
    }

    public static decryptWithPrivateKey(privateKey: any, encryptedMessage: string) {
        let key = new nodeRsa();
        key.importKey(privateKey);
        let decrypted = key.decrypt(encryptedMessage).toString();
        return decrypted;
    }

    /**
     * Pads the hex number and returns the decimal array.
     * @param exponent the decimal turned to hex, returned to decimal array.
     */
    public static getExponentForCSharp(exponent: number) {
        let str = exponent.toString(16);
        let retVal = [];

        // Pad the hex to even number of characters.
        if (str.length % 2 !== 0) {
            str = '0' + str;
        }

        // Split the string into chunks of 2.
        let arr: any = str.match(/.{1,2}/g);
        for (let i = 0; i < arr.length; i++) {
            retVal.push(parseInt(arr[i], 16));
        }

        return retVal;
    }
}