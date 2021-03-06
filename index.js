const RPC = new (require("discord-rpc")).Client({ transport: 'ipc' })
const axios = require('axios');
const { Game } = require('./modules/rpc.js');

let flow;
let token;

flow = new (require('prismarine-auth')).Authflow('', `\auth`, { relyingParty: 'http://xboxlive.com'}).getXboxToken().then((xbl)=>{
    token = `XBL3.0 x=${xbl.userHash};${xbl.XSTSToken}`;
});

RPC.on('ready', () => {
	console.log("\x1B[33m\x1B[1mINFO | The system is starting, please wait! \x1B[37m \n")
	const tokenCheck = setInterval(async () => {
		if(token) {
			clearInterval(tokenCheck);
			const { gamertag } = require('./config.json');
			const userInfo = await axios({ method: "GET", url: "https://profile.xboxlive.com/users/gt(" + gamertag + ")/profile/settings", headers:{ 'x-xbl-contract-version': '2', 'Authorization': token, "Accept-Language": "en-US" }}).catch(e => {});
			const xuid = userInfo.data.profileUsers[0].id;
			
			let lastStatus;
			let lastGame;
			let time;
			
			const infoInterval = setInterval(async () => {
				if(xuid) {
					const info = await axios({ method: "GET", url: "https://userpresence.xboxlive.com/users/xuid(" + xuid + ")?level=all", headers:{ 'x-xbl-contract-version': '2', 'Authorization': token, "Accept-Language": "en-US" }}).catch(e => {});
					if(!info) return;
					
					if(info.data.state == 'Online') {
						if(lastStatus != info.data.state) { lastStatus = info.data.state; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mState Changed to: \x1B[32m" + info.data.state + "\x1B[37m"); }
						info.data.devices.forEach(device => {
							device.titles.forEach(async title => {
								if(lastGame != title.name && title.name != "Online" && title.name != "Home") { lastGame = title.name; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mTitle Changed to: \x1B[32m" + title.name + "\x1B[37m"); }
								const gameInfoFunc = await new Game(title, xuid, device, title.activity?.richPresence, token).getGameInfo();
								if(gameInfoFunc.canceled || gameInfoFunc == true) return;
								
								RPC.setActivity({
									details: gameInfoFunc.details,
									state: gameInfoFunc.state,
									startTimestamp: time,
									largeImageKey: gameInfoFunc.largeImg,
									largeImageText: gameInfoFunc.largeText,
									smallImageKey: gameInfoFunc.smallImg,
									smallImageText: gameInfoFunc.smallText,
								});
							});
						});
					} else {
						if(lastStatus != info.data.state) { lastStatus = info.data.state; time = new Date().getTime(); console.log("\x1B[33m\x1B[1mINFO | \x1B[37mState Changed to: \x1B[31m" + info.data.state + "\x1B[37m"); }
						RPC.setActivity({
							state: "Player is Offline",
							startTimestamp: time,
							largeImageKey: "mclogo",
							largeImageText: "Currently Offline!",
						});
					}
				}
			}, 5000);
		}
	})
});

RPC.login({ clientId : "993228409129943171" }).catch(console.error);
