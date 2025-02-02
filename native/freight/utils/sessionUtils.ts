import * as SecureStore from 'expo-secure-store'

export const saveSession = async (accessToken: string, refreshToken: string, expiresIn: number, user: any) => {
  try {
    if (!accessToken) {
      throw new Error("AccessToken ir tukšs vai undefined.");
    }

    if (!refreshToken) {
      throw new Error("RefreshToken ir tukšs vai undefined.");
    }

    if (!expiresIn) {
      throw new Error("ExpiresIn ir tukšs vai undefined.");
    }

    const sessionData = {
      accessToken,
      refreshToken,
      expiresIn,
      expiresAt: Date.now() + expiresIn * 1000,
      user: user || null
    };

    try {
      await SecureStore.setItemAsync("user_session", JSON.stringify(sessionData));
    } catch (storageError) {
      console.warn("SecureStore not ready or error:", storageError);
      // Don't throw error if storage is not ready, just log warning
      return;
    }
  } catch (error) {
    console.error("Kļūda sesijas saglabāšanā:", error);
    throw error;
  }
};

export const loadSession = async () => {
  try {
    let sessionData;
    try {
      sessionData = await SecureStore.getItemAsync("user_session");
    } catch (storageError) {
      console.warn("SecureStore not ready or error:", storageError);
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }
    
    if (!sessionData) {
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }

    const session = JSON.parse(sessionData);
    
    // Pārbaudam vai tokens nav beidzies
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await clearSession();
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    };
  } catch (error) {
    console.error("Kļūda sesijas ielādēšanā:", error);
    // Return null session instead of throwing to prevent app crash
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }
};

export const clearSession = async () => {
  try {
    try {
      await SecureStore.deleteItemAsync("user_session");
    } catch (storageError) {
      console.warn("SecureStore not ready or error:", storageError);
      // Don't throw error if storage is not ready, just log warning
      return;
    }
  } catch (error) {
    console.error("Kļūda sesijas dzēšanā:", error);
    // Don't throw error to prevent app crash
    return;
  }
};
