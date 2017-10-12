import * as crypto from 'crypto';

export class Symmetric {
    private static ALGORITHM = 'aes-256-cbc';
    private static PASSWORD_SALT = 'RandomSaltForThePassword';

    /**
     * Encrypt the text with the password. This converts the password
     * into a pbfkd2 password and creates a key and iv from it. The
     * key and iv should match what the Android Device was able to
     * create itself.
     * @param text the text to encrypt.
     * @param password the password to use.
     */
    public static encrypt(text: string, password: string): string {
        // We have to use sha1 because rfc2898derived bytes on the C#
        // side is not configurable.
        let pbfkd2 = crypto.pbkdf2Sync(password, Symmetric.PASSWORD_SALT, 10000, 48, 'sha1');
        let key = pbfkd2.slice(0, 32).toString('base64');
        let iv = pbfkd2.slice(32).toString('base64');
        return Symmetric.encryptIV(text, key, iv);
    }

    /**
     * Encrypt the text with the key and initialization vector.
     * @param text the text to encrypt.
     * @param key the key to encrypt with.
     * @param iv the initialization vector to encrypt with.
     */
    public static encryptIV(text: string, key: string, iv: string): string {
        let translatedKey = new Buffer(key, 'base64');
        let translatedIV = new Buffer(iv, 'base64');
        let cipher = crypto.createCipheriv(Symmetric.ALGORITHM, translatedKey, translatedIV);
        return Symmetric._encrypt(text, cipher);
    }

    private static _encrypt(text: string, cipher: crypto.Cipher): string {
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Decrypt the string using the password. This converts the password
     * into a pbfkd2 password and creates a key and iv from it. The
     * key and iv should match what the Android Device was able to
     * create itself.
     * @param encryptedString the encrypted string.
     * @param password the password to use.
     */
    public static decrypt(encryptedString: string, password: string): string {
        // We have to use sha1 because rfc2898derived bytes on the C#
        // side is not configurable.
        let pbfkd2 = crypto.pbkdf2Sync(password, Symmetric.PASSWORD_SALT, 10000, 48, 'sha1');
        let key = pbfkd2.slice(0, 32).toString('base64');
        let iv = pbfkd2.slice(32).toString('base64');
        return Symmetric.decryptIV(encryptedString, key, iv);
    }

    /**
     * Decrypt the text with the key and initialization vector.
     * @param encryptedString the encrypted string.
     * @param key the key to decrypt with.
     * @param iv the initialization vector to decrypt with.
     */
    public static decryptIV(encryptedString: string, key: string, iv: string): string {
        let translatedKey = new Buffer(key, 'base64');
        let translatedIV = new Buffer(iv, 'base64');
        let decipher = crypto.createDecipheriv(Symmetric.ALGORITHM, translatedKey, translatedIV);
        return Symmetric._decrypt(encryptedString, decipher);
    }

    private static _decrypt(encryptedString: string, decipher: crypto.Decipher): string {
        let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}