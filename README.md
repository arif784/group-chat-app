# group-chat-app
Group Chat App is a multi users chat application.

# Prerequisites
- Node JS  - You can download Node JS from [here](https://nodejs.org/en/download/)
- MongoDB - You can download MongoDB from [here](https://www.mongodb.com/try/download/community)

# Installation
First install the PM2
```bash
npm install -g '@socket.io/pm2'
```
If pm2 is already installed, you will have to remove it first:
```bash
npm remove -g pm2 
```
@socket.io/pm2 can be used as a drop-in replacement for pm2, and supports all the commands of the class pm2 utility.

Now clone the github repository [group-chat-app](https://github.com/arif784/group-chat-app.git)
```bash
git clone https://github.com/arif784/group-chat-app.git
```
# Running the server
```bash
cd group-chat-app
npm install
npm start
```

open http://localhost:5000 in your browser, you should see:

![Home Page](https://github.com/arif784/group-chat-app/blob/main/assets/Screenshot%202022-03-05%20220440.png?raw=true)

## License

[MIT](LICENSE)