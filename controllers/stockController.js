class stockcontroller{

	constructor(){}

	/*
		@method getPrice
		@param {string} name Name of the product to search on external link
		@param {any} cb Callback function
	*/
	getPrice(name, cb){
		let request = require('request');
		const url = "https://repeated-alpaca.glitch.me/v1/stock/"+name+"/quote";
		request(url, (err, response) =>{
			cb(err || !response || !response.body ? null : JSON.parse(response.body).latestPrice);
		})
	}
}

module.exports = new stockcontroller();