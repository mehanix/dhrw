FROM python:3
WORKDIR /app
COPY connection.py ./
COPY requirements.txt ./
COPY wait-for-it.sh ./

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT [ "./wait-for-it.sh", "rabbitmq:5672", "--", "python3", "-u", "connection.py" ]