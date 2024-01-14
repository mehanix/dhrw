import { API_URL } from "../utils/constants";

export const FunctionRepository = {
  state: 0, // initial state
  reducers: {
    setFunctions(state, functions) {
        return functions
    }
  },
  effects: (dispatch) => ({
    async getFunctionRepository(state) {
        let response = await fetch(API_URL + "/functions")
        let json = await response.text();

        dispatch.FunctionRepository.setFunctions(JSON.parse(json))
    }
  }),
};