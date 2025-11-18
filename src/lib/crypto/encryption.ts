/**
 * Data Encryption Service
 * Implements AES-256-GCM encryption for sensitive data at rest
 */

import * as crypto from 'crypto';

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag: string;
}

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits
  private authTagLength = 16; // 128 bits

  /**
   * Get encryption key from environment or generate one
   */
  private getEncryptionKey(): Buffer {
    const keyBase64 = process.env.ENCRYPTION_KEY;
    
    if (!keyBase64) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }

    const key = Buffer.from(keyBase64, 'base64');
    
    if (key.length !== this.keyLength) {
      throw new Error(`Encryption key must be ${this.keyLength} bytes`);
    }

    return key;
  }

  /**
   * Generate a new encryption key
   */
  generateKey(): string {
    const key = crypto.randomBytes(this.keyLength);
    return key.toString('base64');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(plaintext: string, additionalData?: string): EncryptionResult {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Add additional authenticated data if provided
      if (additionalData) {
        cipher.setAAD(Buffer.from(additionalData, 'utf8'));
      }

      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(
    encrypted: string,
    iv: string,
    authTag: string,
    additionalData?: string
  ): string {
    try {
      const key = this.getEncryptionKey();
      const ivBuffer = Buffer.from(iv, 'base64');
      const authTagBuffer = Buffer.from(authTag, 'base64');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
      decipher.setAuthTag(authTagBuffer);
      
      // Add additional authenticated data if provided
      if (additionalData) {
        decipher.setAAD(Buffer.from(additionalData, 'utf8'));
      }

      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt and encode as a single string (for database storage)
   */
  encryptToString(plaintext: string, additionalData?: string): string {
    const result = this.encrypt(plaintext, additionalData);
    return JSON.stringify(result);
  }

  /**
   * Decrypt from encoded string
   */
  decryptFromString(encryptedString: string, additionalData?: string): string {
    const result: EncryptionResult = JSON.parse(encryptedString);
    return this.decrypt(result.encrypted, result.iv, result.authTag, additionalData);
  }

  /**
   * Hash data using SHA-256 (for non-reversible hashing)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data with salt using PBKDF2
   */
  hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const saltBuffer = salt ? Buffer.from(salt, 'base64') : crypto.randomBytes(16);
    const iterations = 100000;
    const keyLength = 64;
    
    const hash = crypto.pbkdf2Sync(
      data,
      saltBuffer,
      iterations,
      keyLength,
      'sha512'
    );

    return {
      hash: hash.toString('base64'),
      salt: saltBuffer.toString('base64')
    };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const result = this.hashWithSalt(data, salt);
    return this.constantTimeCompare(result.hash, hash);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Encrypt sensitive fields in an object
   */
  encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    additionalData?: string
  ): T {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null) {
        const value = String(result[field]);
        result[field] = this.encryptToString(value, additionalData) as any;
      }
    }
    
    return result;
  }

  /**
   * Decrypt sensitive fields in an object
   */
  decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    additionalData?: string
  ): T {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null) {
        try {
          const value = String(result[field]);
          result[field] = this.decryptFromString(value, additionalData) as any;
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error);
          // Keep encrypted value if decryption fails
        }
      }
    }
    
    return result;
  }

  /**
   * Rotate encryption key (re-encrypt data with new key)
   */
  async rotateKey(
    oldKey: string,
    newKey: string,
    encryptedData: string,
    additionalData?: string
  ): Promise<string> {
    // Temporarily set old key
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = oldKey;
    
    try {
      // Decrypt with old key
      const plaintext = this.decryptFromString(encryptedData, additionalData);
      
      // Set new key
      process.env.ENCRYPTION_KEY = newKey;
      
      // Encrypt with new key
      const reencrypted = this.encryptToString(plaintext, additionalData);
      
      return reencrypted;
    } finally {
      // Restore original key
      process.env.ENCRYPTION_KEY = originalKey;
    }
  }
}

export const encryptionService = new EncryptionService();

/**
 * Helper function to encrypt sensitive database fields
 */
export async function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[]
): Promise<T> {
  return encryptionService.encryptFields(data, sensitiveFields);
}

/**
 * Helper function to decrypt sensitive database fields
 */
export async function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[]
): Promise<T> {
  return encryptionService.decryptFields(data, sensitiveFields);
}