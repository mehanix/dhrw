
# 🎢 DHRW ~ Visual Data Pipelines
DHRW is a proof-of-concept for a low-code, IaaS platform to let you visually create data processing pipelines. [See it in action!](https://www.youtube.com/watch?v=6WjEC7rRUQU)

![image](https://github.com/user-attachments/assets/b942acab-afef-4d76-96da-d33efb5b2cb2)

## ✅ Features

#### ⌨️ **Write** your Python functions (or use functions written by others and imported in the app)
![image](https://github.com/user-attachments/assets/caa09e1f-7a80-49c4-9395-70cc496ada41)

#### 🔗 **Add** them to a GitHub repository [(example repo)](https://github.com/mehanix/dhrw-functions)

![image](https://github.com/user-attachments/assets/c37eae98-9ce9-40c1-b301-5563c8f4baec)

#### 📥 **Import** them in the app

![image](https://github.com/user-attachments/assets/3c8c895b-52d3-4753-b34a-f1bc5df9dc9f)
  
#### 💫 **Connect** them to create _execution graphs_ - a sequence of functions that you can pipe data through

![image](https://github.com/user-attachments/assets/d409a55e-83ac-481d-99ba-6983098ec79d)


#### 🚀 Deploy in the cloud
With just the press of one button, you can **auto-magically turn a series of functions into a network of Docker containers** that are provisioned with your code and wait to receive and process your data.

![image](https://github.com/user-attachments/assets/c86ea1bc-0042-41be-8ccf-2d043cc2a843)

#### 📑 Process data

You can then **upload** CSV files with your data and **receive** the processing results right in your browser. Supports both **text** as well as **image** outputs (for plots).

![image](https://github.com/user-attachments/assets/22baa3ae-cc8f-4de9-82b3-d6aeb1d655e0)

![image](https://github.com/user-attachments/assets/9d841bc7-bc48-4aa6-8aca-05bd37a80fb7)


#### 👨🏻‍💻 Live edit & redeploy

🌐  Pairs really well with GitHub Codespaces to completely **develop right in the browser**. Edit your function code using VSCode in the browser, reupload it in the graph, and redeploy in two clicks. 🙌 

![image](https://github.com/user-attachments/assets/a6cbb4f1-dd37-457c-8c7a-de05ee37b6a8)

## 🐳 Get it running 

Setup is a bit tricky since this is a proof-of-concept. Here are the steps to get it running locally:

##### Main setup
1. Clone repository
2. `docker compose up`
3. Manually install python dependencies (found in `worker/requirements.txt` on the meteor container) - known issue, they need to be synchronised 😅
4. Get an access token for your function repository and add it in settings.json, replacing the one that is there (expired, used to point to [this repo](https://github.com/mehanix/dhrw-functions)).

##### RabbitMQ setup
1. enter localhost:15672 and add workers exchange of type `topic`
2. also add a routing key named `worker_reply.*` to `server_responses` queue on this exchange. - known issue, they need to be added manually for now.

##### Get in the app
Enter the app via `localhost:3000`.



## 🤖 Tech stack

![image](https://github.com/user-attachments/assets/86bec09c-18d3-4248-84e8-bea5fd271525)

## 📜 Docs 

Read the docs [here](https://github.com/mehanix/dhrw/blob/32abfdf1329d02b66804a914cff42167a04d6be6/docs%20(in%20romanian).pdf) (in Romanian, this was my master's thesis project).

# 🎬 Demo video

[![dhrw video](https://img.youtube.com/vi/6WjEC7rRUQU/0.jpg)](https://www.youtube.com/watch?v=6WjEC7rRUQU)
