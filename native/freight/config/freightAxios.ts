import {getFreightTrackingApiUrl} from './environment'
import {createAxiosInstance} from './axios'

// Create and export freight axios instance
const freightAxiosInstance = createAxiosInstance(getFreightTrackingApiUrl());
export default freightAxiosInstance;
