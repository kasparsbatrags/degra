import AsyncStorage from '@react-native-async-storage/async-storage'

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

    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    await AsyncStorage.setItem("expiresIn", String(expiresIn));

    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error("Kļūda sesijas saglabāšanā:", error);
    throw error;
  }
};

export const loadSession = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const user = await AsyncStorage.getItem("user");

    return {
      accessToken,
      refreshToken,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.error("Kļūda sesijas ielādēšanā:", error);
    throw error;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Kļūda sesijas dzēšanā:", error);
    throw error;
  }
};
