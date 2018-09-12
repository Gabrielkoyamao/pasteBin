var express = require('express');
var router = express.Router();
var nosql = require('../nosql')
var moment = require('moment-timezone');

var hash = function (s) {
	var a = 1,
		c = 0,
		h, o;
	if (s) {
		a = 0;
		for (h = s.length - 1; h >= 0; h--) {
			o = s.charCodeAt(h);
			a = (a << 6 & 268435455) + o + (o << 14);
			c = a & 266338304;
			a = c !== 0 ? a ^ c >> 21 : a;
		}
	}
	return String(a);
};

router.get('/', function (req, res, next) {
	res.render('index');
});


router.all('/save', function (req, res, next) {

	var data = req.query

	if (req.query.doc != "") {

		// tratar oq vem do select dps
		var expiraEm = new moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm')

		var link = hash(req.query.titulo)
		data.link = link
		data.criadoEm = new moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm')

		nosql.db(function (db) {
			db.collection('docs').insertOne(data, function(){
				res.json({link: data.link})
			})
		})
	} else {
		res.json({err: 1})
	}



});

router.all('/:link', function(req, res){
	
	var link = req.params.link

	nosql.db(function(db){
		db.collection('docs').find({"link": link}).toArray(function(err, data){
			if(err){
				console.log(err)
			}else{
				if(data.length == 0){
					res.send('404 error</br>Link nao encontrada')
				}else{
					res.render('docs',{
						doc: data[0].doc,
						titulo: data[0].titulo
					})
				}
			}
		})
	})
})

module.exports = router;