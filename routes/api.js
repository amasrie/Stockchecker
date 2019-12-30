/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let expect = require('chai').expect;
let ObjectId = require('mongodb').ObjectID;
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let stock = require('../controllers/stockController');
let dns = require('dns');

const CONNECTION_STRING = process.env.DB; 

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = function (app) {
	//create mongo connection
	mongoose.connect(process.env.DB,
	  { useNewUrlParser: true, useUnifiedTopology: true }
	);

	//import models
	let addressModel = require('../models/address')(mongoose);

	/*
		Method that counts the number of likes for a product
		@method countLikes
		@param {string} name Name of the product
		@param {any} cb Callback function
	*/
	let countLikes = (name, cb) =>{
		addressModel.countDocuments({product: name}, (err, count) =>{
			if(err){
				res.status(500).send("An error occured while trying to get the likes");
			}else{
				cb(count);
			}
		})
	}

	/*
		Method that calls the controller to get the price of the product
		@method getPrice
		@param {string} name Name of the product
		@param {any} cb Callback function
	*/
	let getPrice = (name, res, cb) => {
		stock.getPrice(name, price =>{
			if(!price){
				res.status(404).send("Price not found");
			}else{
				cb(price);
			}			
		})
	}

	/*
		Method that checks how many items are sent and then count likes if necessary
		@method getQuantity
		@param {any} productList List of items indicated
		@param {any} list List to loop over
		@param {int} position Index watching
		@param {any} json Object with value to send
		@param {any} res Response object
	*/
	let getQuantity = (productList, list, position, json, res) => {
		if(productList.length == 1){
			//if there's only one item, count the likes
			countLikes(json.stock, count => {
				json.likes = count;
				loopList(list, position + 1, json, res);
			});
		}else{
			//if there are two the relation doesn't change
			loopList(list, position + 1, json, res);
		}
	}

	/*
		Method that loops recursively over a list to get the prices and add likes
		@method loopList
		@param {any} list List to loop over
		@param {int} position Index watching
		@param {any} json Object with value to send
		@param {any} res Response object
	*/
	let loopList = (list, position, json, res) =>{
		if(position < list.length){
			//getting next value
	    	if(typeof list[position] == 'string'){
	    		//case for stocks
	    		getPrice(list[position], res, price =>{
    				if(!json){
    					//no json means this is the first stock
    					let newJson = {
    						stock: list[position],
    						price: price
    					};
    					loopList(list, position + 1, newJson, res);
    				}else{
    					//a not null json means a comparison of products (array)
			    		getPrice(list[position], res, price =>{
							countLikes(json.stock, countFst =>{
								countLikes(list[position], countSnd =>{
									json.rel_likes = countFst - countSnd;
			    					let newJson = [json];
			    					newJson.push({
			    						stock: list[position],
			    						price: price,
			    						rel_likes: countSnd - countFst
			    					});
			    					loopList(list, position + 1, newJson, res);
								})
							})
						})
    				}
	    		})
	    	}else{
	    		//case for likes
	    		//check the number of stocks
	    		if(position == 0){
		    		//zero means error
		    		res.status(412).send("To send a like, a product must me indicated")
	    		}else{
	    			//for one or two, save a new like (if the ip is new)
	    			dns.lookup(require('os').hostname(), (err, ipAddress) => {
  						if(err){
  							res.status(502).send("Could not get IP address");
  						}else{
			    			addressModel.find({ip: ipAddress}, (err, match) =>{
			    				if(err){
			    					res.status(500).send("An error occured while trying to get a matching address");
			    				}else{
		    						let productList = [];
		    						for(let i = 0; i < position; i++){
		    							productList.push({
		    								product: list[i],
		    								ip: ipAddress
		    							})
		    						}
			    					if(!match || !match.length){
			    						//new IP, must save a document for each item
			    						addressModel.create(productList, err => {
			    							if(err){
			    								res.status(500).send("An error occured while trying to save the likes");
			    							}else{
			    								getQuantity(productList, list, position, json, res);
			    							}
			    						})
			    					}else{
			    						//IP already existing, continue
										getQuantity(productList, list, position, json, res);
					    			}
			    				}
			    			})

  						}
					})
	    		}
	    	}
		}else{
			//end of the loop
			if(json && !json[0] && !json.hasOwnProperty("likes")){
				//if the object is not an array and doesn't have likes yet, get the likes on that product
				countLikes(json.stock, count =>{
					json.likes = count;
					res.send(json);
				})
			}else{
				res.send(json);
			}
		}
	}

	app.route('/api/stock-prices')
    	.get((req, res) => {
    		//saving only the properties needed, others will be ignored
    		let list = [];
    		for(let prop in req.query){
    			if(prop == "stock" || prop == "stock1"){
			    	list.unshift(req.query[prop]);
    			}else if(prop == "like"){
    				//if there is a like property, it will be the last of the list
			    	list.push(req.query[prop] == 'true');
    			}
    		}
    		//recursive call to loop on the list
    		loopList(list, 0, null, res);
		});
    
};
