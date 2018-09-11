var express = require('express');
var router = express.Router();
var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;

var hash = function(s) {
	var a = 1, c = 0, h, o;
	if (s) {
		a = 0;
		for (h = s.length - 1; h >= 0; h--) {
			o = s.charCodeAt(h);
			a = (a<<6&268435455) + o + (o<<14);
			c = a & 266338304;
			a = c!==0?a^c>>21:a;
		}
	}
	return String(a);
};

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});


router.all('/teste', function(req, res, next) {

	var doc = req.body.doc
	var titulo = req.body.titulo

	var data = req.body
	var link = hash(titulo)

	data.link = link

	var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});
	mongoclient.open(function(err, mongoclient) {

		var db = mongoclient.db("pastebin");
		
		db.collection('teste').find({}).toArray(function(err, result) {
			throw err
			console.log(result)
		})

		db.collection('docs').insert( data ).toArray(function(err, result) {
			console.log(result)
		})

		mongoclient.close();
    });
});

module.exports = router;
