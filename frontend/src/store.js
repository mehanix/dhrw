import { init } from "@rematch/core";
import { ComputationGraphs } from "./models/computation-graphs";
import { FunctionRepository } from "./models/function-repository";

const store = init({ 
    models: {ComputationGraphs, FunctionRepository}
 });
export default store;