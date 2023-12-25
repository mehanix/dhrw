import { init } from "@rematch/core";
import { ComputationGraphs } from "./models/computation-graphs";
const store = init({ 
    models: {ComputationGraphs}
 });
export default store;