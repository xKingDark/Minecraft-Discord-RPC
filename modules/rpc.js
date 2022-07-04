const axios = require('axios');

class Game {
	constructor(title, xuid, device, activity, token) {
		this.title = title;
		this.xuid = xuid;
		this.device = device;
		this.activity = activity ?? "Loading the activity!";
		this.token = token;
		
		this.state = this.activity;
		this.details;
		
		this.largeImg;
		this.largeText
		this.smallImg;
		this.smallText;
		
		this.canceled = false;
	}
	
	async getGameInfo() {
		const allowedTitles = ["896928775", "1904044383", "1739947436", "1810924247", "1828326430", "2044456598", "1739375565", "1794566092"];
		const res = await axios.get(`https://titlehub.xboxlive.com/users/xuid(` + this.xuid + `)/titles/titlehistory/decoration/scid,image,detail`, { headers:{ 'x-xbl-contract-version': '2', 'Authorization': this.token, "Accept-Language": "en-US" }}).catch(e => {});
		
		if(res) {
			res.data.titles.forEach(title => {
				if(title.titleId == this.title.id) {
					this.details = title.name;
				}
			})
		}
		
		//Minecraft for Windows: 896928775
		//Minecraft Preview for Windows: 1904044383
		//Minecraft for Android: 1739947436
		//Minecraft for iOS: 1810924247
		//Minecraft Console: 1828326430
		//Minecraft for PlayStation: 2044456598
		//Minecraft Dungeons: 1739375565
		//Minecraft Launcher: 1794566092
		
		if(this.title.id == 896928775) {
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
		} else if(this.title.id == 1739947436 || this.title.id == 1810924247) {
			this.largeImg = "mc";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.id == 1828326430) {
			if(this.activity && this.activity.startsWith("Playing in")) {
				this.largeImg = "mcxboxlogo";
				this.largeText = this.details;
				this.smallImg = "mcpreview";
				this.smallText = "Currently Playing";
			} else if(this.activity && this.activity.startsWith("Playing on")) {
				this.largeImg = "mcxboxlogo";
				this.largeText = this.details;
				this.smallImg = "netherportal";
				this.smallText = "Currently Playing on Minecraft Realms";
			} else {
				this.largeImg = "mcxboxlogo";
				this.largeText = this.details;
			}
		} else if(this.title.id == 1794566092) {
			this.largeImg = "mclauncherlogo";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.id == 1739375565) {
			this.largeImg = "mcdungeonslogo";
			this.largeText = this.details;
			this.state = undefined;
		} else if(this.title.id == 1904044383) {
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
			if(this.device.titles.filter(title => allowedTitles.includes(title.id)).length != 0) return this.canceled = true;
			
			this.state = "Player is online and is not playing!";
			this.largeImg = "mclogo";
			this.largeText = "Currently not playing!";
		}
		
		return { canceled: this.canceled, state: this.state, details: this.details, largeImg: this.largeImg, largeText: this.largeText, smallImg: this.smallImg, smallText: this.smallText };
	}
}

module.exports = { Game };
