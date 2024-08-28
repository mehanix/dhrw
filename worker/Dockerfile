FROM python:3

WORKDIR /app

COPY requirements.txt ./
COPY wait-for-it.sh ./

RUN pip install -r requirements.txt

#COPY . .

ENTRYPOINT [ "./wait-for-it.sh", "-q", "rabbitmq:5672", "--", "python3", "-u", "main.py" ]
