import pandas
from typing import List
from pydantic import BaseModel
import json

class Input(BaseModel):
    dataframeAsJson: str #not great i know

class Output(BaseModel):
    array: List[int]

def cleanup(input:Input) -> Output:

    inputDf = pandas.read_json(input.dataframeAsJson) # I could do this in a decorator/before running the function
    result = Output(array=[])

    for val in inputDf['value']:
        try:
            int_val = int(val)
            result.array.append(int_val)
        except ValueError:
            continue
    return result

main_model_schema = Input.model_json_schema()  # (1)!
print(json.dumps(main_model_schema, indent=2))  # (2)!