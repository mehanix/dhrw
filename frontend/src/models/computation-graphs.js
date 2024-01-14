import { API_URL } from "../utils/constants";

export const ComputationGraphs = {
  state: 0, // initial state
  reducers: {
    setGraphs(state, computationGraphs) {
        return computationGraphs
    }
  },
  effects: (dispatch) => ({
    async setComputationGraphs(state) {
        let response = await fetch(API_URL + "/graphs")
        let json = await response.text();

        dispatch.ComputationGraphs.setGraphs(JSON.parse(json))
    }
  }),
};