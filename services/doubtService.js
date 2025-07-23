import { api } from "./api";

const doubtService = {

    getStudentDoubts: async () => {
        const response = await api.get(`/doubts/student`);
        return response.data;
    },

    replyToDoubt: async (doubtId, params) => {
        const response = await api.post(`/doubts/${doubtId}/reply`, params);
        return response.data;
    },

    
}
export default doubtService;
