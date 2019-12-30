/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotArray(res.body, 'response shouldn\'t be an array');
          assert.property(res.body, 'stock', 'Item should have a stock property');
          assert.property(res.body, 'price', 'Item should have a price property');
          assert.property(res.body, 'likes', 'Item should have a likes property');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotArray(res.body, 'response shouldn\'t be an array');
          assert.property(res.body, 'stock', 'Item should have a stock property');
          assert.property(res.body, 'price', 'Item should have a price property');
          assert.property(res.body, 'likes', 'Item should have a likes property');
          assert.isAbove(res.body.likes, 0, "There must be at least a like");
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotArray(res.body, 'response shouldn\'t be an array');
          assert.property(res.body, 'stock', 'Item should have a stock property');
          assert.property(res.body, 'price', 'Item should have a price property');
          assert.property(res.body, 'likes', 'Item should have a likes property');
          assert.isAbove(res.body.likes, 0, "There must be at least a like");
          assert.isBelow(res.body.likes, 2, "There can't be more than one like");
          done();
        });
      });
      
      test('2 stocks', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', stock1:'msft'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'stock', 'Item should have a stock property');
          assert.property(res.body[0], 'price', 'Item should have a price property');
          assert.property(res.body[0], 'rel_likes', 'Item should have a rel_likes property');
          assert.equal(res.body.length, 2);
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', stock1:'msft', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'stock', 'Item should have a stock property');
          assert.property(res.body[0], 'price', 'Item should have a price property');
          assert.property(res.body[0], 'rel_likes', 'Item should have a rel_likes property');
          assert.equal(res.body.length, 2);
          assert.notEqual(res.body[0].rel_likes, res.body[1].rel_likes, "There can't be more than one like from the same user");
          done();
        });
        
      });
      
    });

});
