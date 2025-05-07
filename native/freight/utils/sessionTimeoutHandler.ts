import { isSessionActive } from './sessionUtils';
import { redirectToLogin, isRedirectingToLogin } from '../config/axios';
import { Platform } from 'react-native';

// Sesijas pārbaudes intervāls (ms)
const SESSION_CHECK_INTERVAL = 60000; // 1 minūte

let sessionCheckInterval: NodeJS.Timeout | null = null;

/**
 * Uzsāk sesijas noilguma pārbaudi
 */
export const startSessionTimeoutCheck = () => {
  // Apturām esošo intervālu, ja tāds ir
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
  
  // Izveidojam jaunu intervālu
  sessionCheckInterval = setInterval(async () => {
    // Pārbaudam, vai jau nenotiek pārvirzīšana uz login lapu
    if (isRedirectingToLogin) {
      return; // Ja jau notiek pārvirzīšana, tad izejam no funkcijas
    }
    
    const active = await isSessionActive();
    
    // Ja sesija vairs nav aktīva, novirzām uz login lapu
    if (!active) {
      // Izmantojam kopīgo redirectToLogin funkciju no axios.ts
      redirectToLogin();
    }
  }, SESSION_CHECK_INTERVAL);
  
  // Pievienojam event listener, lai apturētu intervālu, kad lapa tiek aizvērta (tikai web)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopSessionTimeoutCheck);
  }
};

/**
 * Aptur sesijas noilguma pārbaudi
 */
export const stopSessionTimeoutCheck = () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  
  // Noņemam event listener (tikai web)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', stopSessionTimeoutCheck);
  }
};
