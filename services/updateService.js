import { api } from "./api";


const updateService = {

    update: async (version) => {
        try {
            const response = await api.get(`/update?version=${version}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


}
export default updateService;