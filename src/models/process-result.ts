import Data from "./data";
import { ManagerOptions } from "../config/managerconfig";

interface ProcessResult { 
    options: ManagerOptions, 
    data: Data[]
};

export default ProcessResult;