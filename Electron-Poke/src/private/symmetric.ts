import * as crypto from 'crypto';

export class Symmetric {
    private static ALGORITHM = 'aes-256-cbc';

    /**
     * Encrypt the text with the password.
     * @param text the text to encrypt.
     * @param password the password to use.
     */
    public static encrypt(text: string, password: string): string {
        let cipher = crypto.createCipher(Symmetric.ALGORITHM, password);
        return Symmetric._encrypt(text, cipher);
    }

    /**
     * Encrypt the text with the key and initialization vector.
     * @param text the text to encrypt.
     * @param key the key to encrypt with.
     * @param iv the initialization vector to encrypt with.
     */
    public static encryptIV(text: string, key: string, iv: string): string {
        let translatedKey = new Buffer(key, 'hex');
        let translatedIV = new Buffer(iv, 'hex');
        let cipher = crypto.createCipheriv(Symmetric.ALGORITHM, translatedKey, translatedIV);
        return Symmetric._encrypt(text, cipher);
    }

    private static _encrypt(text: string, cipher: crypto.Cipher): string {
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Decrypt the string using the password.
     * @param encryptedString the encrypted string.
     * @param password the password to use.
     */
    public static decrypt(encryptedString: string, password: string): string {
        let decipher = crypto.createDecipher(Symmetric.ALGORITHM, password);
        return Symmetric._decrypt(encryptedString, decipher);
    }

    /**
     * Decrypt the text with the key and initialization vector.
     * @param encryptedString the encrypted string.
     * @param key the key to decrypt with.
     * @param iv the initialization vector to decrypt with.
     */
    public static decryptIV(encryptedString: string, key: string, iv: string): string {
        let translatedKey = new Buffer(key, 'hex');
        let translatedIV = new Buffer(iv, 'hex');
        let decipher = crypto.createDecipheriv(Symmetric.ALGORITHM, translatedKey, translatedIV);
        return Symmetric._decrypt(encryptedString, decipher);
    }

    private static _decrypt(encryptedString: string, decipher: crypto.Decipher): string {
        let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}