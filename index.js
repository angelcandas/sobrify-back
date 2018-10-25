'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;
var dburi=process.env.MONGODB_URI || 'mongodb://localhost:27017/curso_mean2';
mongoose.connect(dburi,(err,res)=>{
	if(err){
		throw err;
	}
	else{
		console.log("La base de datos esta corriendo bitch")
		app.listen(port,function(){
			console.log("Servidor app musica escuchando en "+port)
		})
	}
})