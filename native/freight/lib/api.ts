import axios from 'axios'
import {Buffer} from 'buffer'
import {clearSession, loadSession} from '../utils/sessionUtils'

const SERVER_BASE_URL = "http://10.0.2.2:8080";

interface ApiEndpoints {
  REGISTRATION: string;
  LOGIN: string;
  LOGOUT: string;
  GET_ME_INFO: string;
  FREIGHT_BASE: string;
}

const API: ApiEndpoints = {
  REGISTRATION: `${SERVER_BASE_URL}/api/user/register`,
  LOGIN: `${SERVER_BASE_URL}/api/user/login`,
  LOGOUT: `${SERVER_BASE_URL}/api/user/logout`,
  GET_ME_INFO: `${SERVER_BASE_URL}/api/user/me`,
  FREIGHT_BASE: `${SERVER_BASE_URL}/api/freight`,
};

interface UserRegistrationData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationRegistrationNumber: string;
  password: string;
}

interface UserLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const decodeJwt = (token: string): any | null => {
  const atob = (input: string) => Buffer.from(input, "base64").toString("binary");
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    return decodedPayload;
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
      },
      credentials: [
        {
          type: "password",
          value: data.password,
          temporary: false,
        },
      ],
    };

    const response = await axios.post(API.REGISTRATION, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    const response = await axios.post<UserLoginResponse>(API.LOGIN, {
      email,
      password,
    });
    const session = response.data;
    const userInfo = decodeJwt(session.access_token);
    
    if (!userInfo) {
      throw new Error("Neizdevās nolasīt lietotāja informāciju no tokena.");
    }

    const user: UserInfo = {
      id: userInfo.id,
      name: `${userInfo.given_name} ${userInfo.family_name}`,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
    };

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      user,
    };
  } catch (error: any) {
    console.error("Kļūda pieteikšanās laikā:", error);
    if (error.response?.status === 401) {
      throw new Error("Nepareizs e-pasts vai parole");
    }
    throw new Error(error.response?.data?.message || "Pieteikšanās kļūda");
  }
};

export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const { accessToken } = await loadSession();
    if (!accessToken) {
      console.error("Nav pieejams accessToken.");
      return null;
    }

    const response = await axios.get(API.GET_ME_INFO, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return response.data;
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
    const { accessToken } = await loadSession();
    if (!accessToken) {
      throw new Error("Nav pieejams access token.");
    }

    const response = await axios.post(
      API.LOGOUT,
      { accessToken },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 204) {
      await clearSession();
    } else {
      throw new Error("Neizdevās veikt izrakstīšanos.");
    }
  } catch (error: any) {
    console.error("Kļūda izrakstoties:", error);
    throw new Error(error.response?.data?.message || "Izrakstīšanās kļūda");
  }
};
