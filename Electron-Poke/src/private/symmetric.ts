import * as crypto from 'crypto';

export class Symmetric {
    private static ALGORITHM = 'aes-256-ctr';

    public static encrypt(text: string, password: string): string {
        let cipher = crypto.createCipher(Symmetric.ALGORITHM, password);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    public static decrypt(encryptedString: string, password: string): string {
        let decipher = crypto.createDecipher(Symmetric.ALGORITHM, password);
        let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}