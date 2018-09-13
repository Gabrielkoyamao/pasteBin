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
	
	var dados = req.query
	
	// datas
	var expiraEm = new moment()
	
	if (req.query.doc != "") {
		
		if(req.query.expiraEm == "10min"){ 
			expiraEm.add(10, 'minutes')
			expiraEm = expiraEm.toDate()			
		}
		else if(req.query.expiraEm == "1hora"){ 
			expiraEm.add(1, 'hour')
			expiraEm = expiraEm.toDate()
		}
		else if(req.query.expiraEm == "1dia"){ 
			expiraEm.add(1, 'day')
			expiraEm = expiraEm.toDate()			
		}
		else if( req.query.expiraEm == "1semana"){
			expiraEm.add(1, 'week')
			expiraEm = expiraEm.toDate()			
		}
		else if(req.query.expiraEm == "1mes"){ 
			expiraEm.add(1, 'month')
			expiraEm = expiraEm.toDate()
		}
		else if(req.query.expiraEm == "6meses"){ 
			expiraEm.add(6, 'month')
			expiraEm = expiraEm.toDate()
		}
		else if(req.query.expiraEm == "1ano"){ 
			expiraEm.add(1, 'year')
			expiraEm = expiraEm.toDate()

		}
		else{ expiraEm = false }

		dados.criadoEm = new moment().toDate()
		dados.expiraEm = expiraEm

		var link = hash(req.query.titulo)
		dados.link = link
		
		nosql.db(function (db) {
			db.collection('docs').insertOne(dados, function(){
				res.json({link: dados.link})
			})
		})
	} else {
		res.json({err: 1})
	}
});

router.all('/analytics', function(req, res){
	res.render("analytics")
})

router.all('/:link', function(req, res){
	
	var link = req.params.link
	
	// teste expira em 10min
	var teste = new moment().add(20, 'minutes').toDate()
	
	nosql.db(function(db){
		db.collection('docs').find({"link": link}).toArray(function(err, dados){
			if(err){
				console.log(err)
			}else{
				if(dados.length == 0){
					res.send('404 error</br>Link nao encontrada')
				}else{
					// validando se expirou
					if(dados[0].criadoEm > dados[0].expiraEm && dados[0].expiraEm != false){
					// if(teste > dados[0].expiraEm && dados[0].expiraEm != false ){
						res.send("O link expirou")
					}
					else{
						res.render('docs',{
							doc: dados[0].doc,
							titulo: dados[0].titulo
						})
					}
				}
			}
		})
	})
})



module.exports = router;