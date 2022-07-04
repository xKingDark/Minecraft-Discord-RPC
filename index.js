const rpc = require("discord-rpc")
const client = new rpc.Client({ transport: 'ipc' })
const axios = require('axios');
const { xbl } = require('@xboxreplay/xboxlive-auth');
const { Authflow } = require('prismarine-auth');
const { Game } = require('./modules/rpc.js');
const { gamertag } = require('./config.json');

let flow;
let token;

flow = new Authflow('', `\auth`, { relyingParty: 'http://xboxlive.com'}).getXboxToken().then((xbl)=>{
    token = `XBL3.0 x=${xbl.userHash};${xbl.XSTSToken}`;
});

client.on('ready', () => {
	console.log("\x1B[33m\x1B[1mINFO | The system is starting, please wait! \x1B[37m \n")
	const tokenCheck = setInterval(async () => {
		if(token) {
			clearInterval(tokenCheck);
			const userInfo = await axios({ method: "GET", url: "https://profile.xboxlive.com/users/gt(" + gamertag + ")/profile/settings", headers:{ 'x-xbl-contract-version': '2', 'Authorization': token, "Accept-Language": "en-US" }}).catch(e => {});
			let xuid = userInfo.data.profileUsers[0].id;
			
			let lastStatus;
			let lastGame;
			let time;
			
			const infoIntervale = setInterval(async () => {
				if(xuid) {
					const info = await axios({ method: "GET", url: "https://userpresence.xboxlive.com/users/xuid(" + xuid + ")?level=all", headers:{ 'x-xbl-contract-version': '2', 'Authorization': token, "Accept-Language": "en-US" }}).catch(e => {});
					if(!info) return;
					
					if(info.data.state == 'Online') {
						if(lastStatus != info.data.state) { lastStatus = info.data.state; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mState Changed to: \x1B[32m" + info.data.state + "\x1B[37m"); }
						info.data.devices.forEach(device => {
							device.titles.forEach(async title => {
								if(lastGame != title.name && title.name != "Online") { lastGame = title.name; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mTitle Changed to: \x1B[32m" + title.name + "\x1B[37m"); }
								const gameInfoFunc = await new Game(title, xuid, device, title.activity?.richPresence, token).getGameInfo();
								if(gameInfoFunc.canceled || gameInfoFunc == true) return;
								
								client.request('SET_ACTIVITY', {
									pid: process.pid,
									activity: {
										details: gameInfoFunc.details,
										state: gameInfoFunc.state,
										timestamps: {
											start: time
										},
										assets: {
											large_image: gameInfoFunc.largeImg,
											large_text: gameInfoFunc.largeText,
											small_image: gameInfoFunc.smallImg,
											small_text: gameInfoFunc.smallText
										}
									}
								})
							})
						})
					} else {
						if(lastStatus != info.data.state) { lastStatus = info.data.state; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mState Changed to: \x1B[31m" + info.data.state + "\x1B[37m"); }
						client.request('SET_ACTIVITY', {
							pid: process.pid,
							activity: {
								state: "Player is Offline",
								timestamps: {
									start: time
								},
								assets: {
									large_image: "mclogo",
									large_text: "Currently Offline!"
								}
							}
						})
					}
				}
			}, 5000);
		}
	})
});

client.login({ clientId : "993228409129943171" }).catch(console.error);
