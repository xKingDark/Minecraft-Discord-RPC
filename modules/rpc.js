const axios = require('axios');

class Game {
    constructor() {}
	
    async getGameInfo(title, xuid, device, activity, token) {
		const res = await axios.get(`https://titlehub.xboxlive.com/users/xuid(` + xuid + `)/titles/titlehistory/decoration/scid,image,detail`, { headers:{ 'x-xbl-contract-version': '2', 'Authorization': token, "Accept-Language": "en-US" }}).catch(e => {});
	
		var state = activity;
		var details;
		
		var largeImg;
		var largeText;
		var smallImg;
		var smallText;
		
		var canceled = false;
		
		if(res) {
			res.data.titles.forEach(ttitle => {
				if(ttitle.titleId == title.id) {
					details = ttitle.name;
				}
			})
		}
		
		if(title.name.includes("Minecraft") && details != "Minecraft" && !title.name.includes("Minecraft Launcher") && !title.name.includes("Minecraft Windows Preview") && !title.name.includes("Minecraft Dungeons")) {
			if(activity && activity.startsWith("Playing in")) {
				largeImg = "mclogo";
				largeText = details;
				smallImg = "mcpreview";
				smallText = "Currently Playing";
			} else if(activity && activity.startsWith("Playing on")) {
				largeImg = "mclogo";
				largeText = details;
				smallImg = "netherportal";
				smallText = "Currently Playing on Minecraft Realms";
			} else {
				largeImg = "mclogo";
				largeText = details;
			}
		} else if(title.name.includes("Minecraft") && details == "Minecraft" && !title.name.includes("Minecraft Launcher") && !title.name.includes("Minecraft Windows Preview")) {
			if(activity && activity.startsWith("Playing in")) {
				largeImg = "mcxboxlogo";
				largeText = details;
				smallImg = "mcpreview";
				smallText = "Currently Playing";
			} else if(activity && activity.startsWith("Playing on")) {
				largeImg = "mcxboxlogo";
				largeText = details;
				smallImg = "netherportal";
				smallText = "Currently Playing on Minecraft Realms";
			} else {
				largeImg = "mcxboxlogo";
				largeText = details;
			}
		} else if(title.name.includes("Minecraft Launcher")) {
			largeImg = "mclauncherlogo";
			largeText = details;
			state = undefined;
		} else if(title.name.includes("Minecraft Dungeons")) {
			largeImg = "mcdungeonslogo";
			largeText = details;
			state = undefined;
		} else if(title.name.includes("Minecraft") && title.name.includes("Minecraft Windows Preview")) {
			if(activity && activity.startsWith("Playing in")) {
				largeImg = "mcpreviewlogo";
				largeText = details;
				smallImg = "mcpreview";
				smallText = "Currently Playing";
			} else if(activity && activity.startsWith("Playing on")) {
				largeImg = "mcpreviewlogo";
				largeText = details;
				smallImg = "netherportal";
				smallText = "Currently Playing on Minecraft Realms";
			} else {
				largeImg = "mcpreviewlogo";
				largeText = details;
			}
		} else {
			if(JSON.stringify(device.titles.filter(t => t.name.startsWith("Minecraft"))) != "[]") return canceled = true;
			
			state = "Player is online and is not playing!";
			largeImg = "mclogo";
			largeText = "Currently not playing!";
		}
		
		return { canceled: canceled, state: state, details: details, largeImg: largeImg, largeText: largeText, smallImg: smallImg, smallText: smallText };
    }
}

module.exports = { Game };