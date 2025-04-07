import {getFreightTrackingApiUrl} from './environment'
import {createAxiosInstance} from './axios'

// Izveido un eksportē freight axios instanci
const freightAxiosInstance = createAxiosInstance(getFreightTrackingApiUrl());
export default freightAxiosInstance;
