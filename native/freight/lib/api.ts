import {jwtDecode} from 'jwt-decode'
import axiosInstance from '../config/axios'
import companyAxiosInstance from '../config/companyAxios'
import {API_ENDPOINTS} from '../config/environment'
import {UserInfo, UserRegistrationData} from '../types/auth'
import {clearSession, loadSession, saveSession} from '../utils/sessionUtils'

interface UserLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const decodeJwt = (token: string): any | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Kļūda, dekodējot JWT tokenu:", error);
    return null;
  }
};

export const createUser = async (data: UserRegistrationData) => {
  try {
    const payload = {
      username: data.email,
      email: data.email,
      enabled: true,
      firstName: data.firstName,
      lastName: data.lastName,
      attributes: {
        organizationRegistrationNumber: data.organizationRegistrationNumber,
        ...(data.truckMaker && { truckMaker: data.truckMaker }),
        ...(data.truckModel && { truckModel: data.truckModel }),
        ...(data.truckRegistrationNumber && { truckRegistrationNumber: data.truckRegistrationNumber }),
        ...(data.fuelConsumptionNorm && { fuelConsumptionNorm: data.fuelConsumptionNorm }),
      },
      credentials: [
        {
          type: "password",
          value: data.password,
          temporary: false,
        },
      ],
    };

    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, payload);

    if (response.status !== 201) {
      throw new Error("Kļūda savienojumā ar serveri!");
    }

    return response.data;
  } catch (error: any) {
    console.error("Kļūda reģistrējot lietotāju:", error);
    throw new Error(error.response?.data?.message || "Reģistrācijas kļūda");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post<{success: boolean, message: string, data: any}>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Pieteikšanās kļūda");
    }

    if (!response.data.data) {
      console.error("Login response data is null or undefined:", response.data);
      throw new Error("Neizdevās saņemt autentifikācijas datus no servera");
    }

    const session = response.data.data;
    const userInfo = decodeJwt(session.access_token);

    if (!userInfo) {
      throw new Error("Neizdevās nolasīt lietotāja informāciju no tokena.");
    }

    const user: UserInfo = {
      id: userInfo.sub,
      name: `${userInfo.given_name} ${userInfo.family_name}`,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
    };

    // Save session data including user info
    await saveSession(session.access_token, session.expires_in, user);

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      user,
    };
  } catch (error: any) {
    console.error("Kļūda pieteikšanās laikā:", error);
    if (error.response?.status === 401) {
      const errorResponse = error.response?.data;
      throw new Error(errorResponse?.message || "Nepareizs e-pasts vai parole");
    }
    throw new Error(error.response?.data?.message || "Pieteikšanās kļūda");
  }
};

export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const { accessToken, user } = await loadSession();
    if (!accessToken) {
      // console.error("Nav pieejams accessToken.");
      return null;
    }

    // If we have user data in session, use that
    if (user) {
      return user;
    }

    // Otherwise fetch from API
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_ME);

    if (response.status === 200) {
      const userData = response.data;
      const userInfo = {
        id: userData.id,
        name: `${userData.given_name} ${userData.family_name}`,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
      };
      
      // Save the user info in session
      await saveSession(accessToken, 0, userInfo);
      
      return userInfo;
    }

    console.error("Neizdevās iegūt lietotāja informāciju");
    return null;
  } catch (error: any) {
    console.error(
      "Kļūda iegūstot lietotāja informāciju:",
      error?.response?.data || error.message
    );
    if (error.response?.status === 401) {
      return null;
    }
    throw new Error(
      error.response?.data?.message || "Kļūda iegūstot lietotāja informāciju"
    );
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await clearSession();
  } catch (error: any) {
    console.error("Kļūda izrakstoties:", error);
    throw new Error(error.response?.data?.message || "Izrakstīšanās kļūda");
  }
};

// Freight tracking specific endpoints
export const getFreightList = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FREIGHT.LIST);
    return response.data;
  } catch (error: any) {
    console.error("Kļūda iegūstot kravu sarakstu:", error);
    throw new Error(error.response?.data?.message || "Kļūda iegūstot kravu sarakstu");
  }
};

export const getFreightDetails = async (id: string) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FREIGHT.DETAILS(id));
    return response.data;
  } catch (error: any) {
    console.error("Kļūda iegūstot kravas informāciju:", error);
    throw new Error(
      error.response?.data?.message || "Kļūda iegūstot kravas informāciju"
    );
  }
};

export const createFreight = async (freightData: any) => {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.FREIGHT.BASE,
      freightData
    );
    return response.data;
  } catch (error: any) {
    console.error("Kļūda izveidojot kravu:", error);
    throw new Error(error.response?.data?.message || "Kļūda izveidojot kravu");
  }
};

export const updateFreightStatus = async (id: string, status: string) => {
  try {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.FREIGHT.STATUS(id),
      { status }
    );
    return response.data;
  } catch (error: any) {
    console.error("Kļūda atjaunojot kravas statusu:", error);
    throw new Error(
      error.response?.data?.message || "Kļūda atjaunojot kravas statusu"
    );
  }
};

export interface CompanySuggestion {
  registerNumber: string;
  name: string;
}

export const searchCompanies = async (query: string): Promise<CompanySuggestion[]> => {
  try {
    const response = await companyAxiosInstance.get(API_ENDPOINTS.COMPANY.SUGGESTION, {
      params: { query }
    });
    return response.data;
  } catch (error: any) {
    console.error("Kļūda meklējot uzņēmumus:", error);
    throw new Error(error.response?.data?.message || "Kļūda meklējot uzņēmumus");
  }
};
