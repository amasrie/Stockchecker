module.exports = function(db){
	let addressSchema = db.Schema({
		product: {
			type: String, 
			required: true
		},
		ip: {
			type: String, 
			required: true
		}
	});

	return db.model('address_stock', addressSchema);
};