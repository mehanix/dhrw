import json
from enum import Enum
from typing import Annotated, List

from pydantic import BaseModel, Field, StrictInt
from pydantic.config import ConfigDict
import pandas as pd

from io import StringIO

class Input(BaseModel):
    csv_string: str

class Output(BaseModel):
    list_of_ints: List[int]

def process(input: Input) -> Output:
    df = pd.read_csv(StringIO(input.csv_string))
    print("Read CSV", df)
    lst = df.loc[0, :].values.flatten().tolist()
    return Output(list_of_ints=lst)

print(process(Input(csv_string='"v1","v2","v3","v4","v5"\n1,2,3,4,5')))