import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export const registerUser = async (payload) => {
    try {
        const response = await axios.post(`${API_URL}users/register/`, payload);
        return response.data;
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
};

export const loginUser = async (payload) => {
    try {
        const response = await axios.post(`${API_URL}users/login/`, payload);
        return response.data;
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

export const getUserKyc = async (token) => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`
        };
        const response = await axios.get(`${API_URL}users/kyc/`, { headers });
        return response; 
    } catch (error) {
        console.error('Error fetching KYC data:', error);
        throw error; 
    }
};

export const postUserKyc = async (token, payload) => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
        };

        const response = await axios.post(`${API_URL}users/kyc/`, payload, { headers });
        return response.data; 
    } catch (error) {
        console.error('Error submitting KYC:', error);
        throw error; 
    }
};

export const patchUserKyc = async (token, payload) => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
        };

        const response = await axios.patch(`${API_URL}users/kyc/`, payload, { headers });
        return response.data; 
    } catch (error) {
        console.error('Error submitting KYC:', error);
        throw error; 
    }
};

export const processPayment = async (token, payload) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(`${API_URL}payments/process/`, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };


  export const getDashboard = async (token) => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`
        };
        const response = await axios.get(`${API_URL}payments/dashboard/`, { headers });
        return response; 
    } catch (error) {
        console.error('Error fetching KYC data:', error);
        throw error; 
    }
};

export const downloadReport = async (token) => {
    try {
        const response = await axios.get(`${API_URL}payments/report/`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob' 
        });
        return response; 
    } catch (error) {
        console.error('Error downloading PDF report:', error);
        throw error; 
    }
};