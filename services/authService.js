import { api } from "./api";


const authService = {

    login: async (email, password , pushToken) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                pushToken
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    register: async (email, name, password) => {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
}
export default authService;