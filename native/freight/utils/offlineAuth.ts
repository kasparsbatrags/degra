import { Platform } from 'react-native';

let SecureStore: any = null;
let Crypto: any = null;
let SecureLS: any = null;

if (Platform.OS === 'web') {
  try {
    SecureLS = require('secure-ls');
  } catch (error) {
    // secure-ls nav pieejams
  }
} else {
  SecureStore = require('expo-secure-store');
  Crypto = require('expo-crypto');
}

// Palīgfunkcija paroles hash izveidei
async function getPasswordHash(password: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: izmanto Web Crypto API
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback: vienkāršs hash (nav drošs, bet labāk nekā plain text)
      let hash = 0, i, chr;
      for (i = 0; i < password.length; i++) {
        chr = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash.toString();
    }
  } else {
    // Mobile: izmanto expo-crypto
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }
}

// Saglabā lietotāja e-pastu un paroles hash drošā veidā
export async function saveOfflineCredentials(email: string, password: string) {
  const key = `offline_credentials_${email.toLowerCase()}`;
  const passwordHash = await getPasswordHash(password);

  if (Platform.OS === 'web') {
    if (SecureLS) {
      const secureLS = new SecureLS({
        encodingType: 'aes',
        isCompression: false,
        encryptionSecret: 'freight-offline-login'
      });
      secureLS.set(key, passwordHash);
    } else {
      localStorage.setItem(key, passwordHash);
    }
  } else {
    await SecureStore.setItemAsync(key, passwordHash);
  }
}

// Pārbauda, vai ievadītie dati sakrīt ar lokāli saglabātajiem
export async function verifyOfflineCredentials(email: string, password: string): Promise<boolean> {
  const key = `offline_credentials_${email.toLowerCase()}`;
  let storedHash: string | null = null;

  if (Platform.OS === 'web') {
    if (SecureLS) {
      const secureLS = new SecureLS({
        encodingType: 'aes',
        isCompression: false,
        encryptionSecret: 'freight-offline-login'
      });
      storedHash = secureLS.get(key);
    } else {
      storedHash = localStorage.getItem(key);
    }
  } else {
    storedHash = await SecureStore.getItemAsync(key);
  }

  if (!storedHash) return false;
  const inputHash = await getPasswordHash(password);
  return storedHash === inputHash;
}
