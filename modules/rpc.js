const axios = require('axios');

class Game {
	constructor(title, xuid, device, activity, token) {
		this.title = title;
		this.xuid = xuid;
		this.device = device;
		this.activity = activity;
		this.token = token;
		
		this.state = activity;
		this.details;
		
		this.largeImg;
		this.largeText
		this.smallImg;
		this.smallText;
		
		this.canceled = false;
	}
	
	async getGameInfo() {
		const res = await axios.get(`https://titlehub.xboxlive.com/users/xuid(` + this.xuid + `)/titles/titlehistory/decoration/scid,image,detail`, { headers:{ 'x-xbl-contract-version': '2', 'Authorization': this.token, "Accept-Language": "en-US" }}).catch(e => {});
		
		if(res) {
			res.data.titles.forEach(title => {
				if(title.titleId == this.title.id) {
					this.details = title.name;
				}
			})
		}
		
		if(this.title.name.includes("Minecraft") && this.details != "Minecraft" && !this.title.name.includes("Minecraft Launcher") && !this.title.name.includes("Minecraft Windows Preview") && !this.title.name.includes("Minecraft Dungeons")) {
			if(this.activity && this.activity.startsWith("Playing in")) {
				this.largeImg = "mclogo";
				this.largeText = this.details;
				this.smallImg = "mcpreview";
				this.smallText = "Currently Playing";
			} else if(this.activity && this.activity.startsWith("Playing on")) {
				this.largeImg = "mclogo";
				this.largeText = this.details;
				this.smallImg = "netherportal";
				this.smallText = "Currently Playing on Minecraft Realms";
			} else {
				this.largeImg = "mclogo";
				this.largeText = this.details;
			}
		} else if(this.title.name.includes("Minecraft") && this.details == "Minecraft" && !this.title.name.includes("Minecraft Launcher") && !this.title.name.includes("Minecraft Windows Preview")) {
			this.largeImg = "mcxboxlogo";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.name.includes("Minecraft Launcher")) {
			this.largeImg = "mclauncherlogo";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.name.includes("Minecraft Dungeons")) {
			this.largeImg = "mcdungeonslogo";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.name.includes("Minecraft") && this.title.name.includes("Minecraft Windows Preview")) {
			if(this.activity && this.activity.startsWith("Playing in")) {
				this.largeImg = "mcpreviewlogo";
				this.largeText = this.details;
				this.smallImg = "mcpreview";
				this.smallText = "Currently Playing";
			} else if(this.activity && this.activity.startsWith("Playing on")) {
				this.largeImg = "mcpreviewlogo";
				this.largeText = this.details;
				this.smallImg = "netherportal";
				this.smallText = "Currently Playing on Minecraft Realms";
			} else {
				this.largeImg = "mcpreviewlogo";
				this.largeText = this.details;
			}
		} else {
			if(JSON.stringify(this.device.titles.filter(title => title.name.startsWith("Minecraft"))) != "[]") return this.canceled = true;
			
			this.state = "Player is online and is not playing!";
			this.largeImg = "mclogo";
			this.largeText = "Currently not playing!";
		}
		
		return { canceled: this.canceled, state: this.state, details: this.details, largeImg: this.largeImg, largeText: this.largeText, smallImg: this.smallImg, smallText: this.smallText };
	}
}

module.exports = { Game };
