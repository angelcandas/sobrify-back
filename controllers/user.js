'use strict'
var fs = require('fs')
var path = require('path')
var User = require('../models/user')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../services/jwt')


function pruebas(req,res){
	res.status(200).json('Probando una accion del controlador bla bla mierda mongo')
}

function saveUser(req,res){
	var user = new User();
	var params = req.body;	

	console.log(params)
	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if(params.password){
		bcrypt.hash(params.password,null,null,function(error,hash){
			user.password = hash;
			if (user.name != null && user.surname != null && user.email != null){
				//Guardar el usuario
				user.save((err,userStored)=>{
					if(err){
						res.status(500).send({message: 'Error al guardar el usuario'})
					}else{
						if(!userStored){
							res.status(400).send({message: 'No se ha registrado el usuario'})
						}
						else{
							res.status(200).send({user: userStored});
						}
					}
				})
			}else{
						res.status(200).json({
							"message": "Introduce todos los campos"
						})
			}
		})
	}else{
		res.status(200).json({
			"message": "Introduce la contrasegna"
		})
		console.log("Introduce la contraseña")
	}
}

function loginUser(req,res){
	var user = new User();
	var params = req.body;
	var email = params.email;
	var password = params.password;	
	if(!email || !password){
		res.status(500).send({message: 'Error en usuario o password'});
	}else{
	User.findOne({
		email: email.toLowerCase()
	}, (err,user)=>{
		if(err){
			res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!user){
				res.status(404).send({message: "El mensaje no existe"})
			}else{
				bcrypt.compare(password,user.password,(err,check)=>{
					if(check){
						if(params.gethash){
							res.status(200).json({
								token: jwt.createToken(user)
							})
						}else{
							res.status(200).json(user)
						}
					}else{
						res.status(404).send({message: 'Usuario no logueado'})
					}
				})
			}
		}
	})
 }
}

function updateUser(req,res){
	var userId = req.params.id;
	var update = req.body;
	if (userId != req.user.sub){
		return res.status(500).send({message:"No tienes permiso para actualizar este usuario"})
	}
	User.findByIdAndUpdate(userId,update,(err,userUpdated)=>{
		if(err){
			res.status(500).json({message: 'Error al actualizar el usuario'});
		}else{
			if(!userUpdated){
				res.status(404).json({message: 'El usuario no ha podido loguearse'});
			}else{
				res.status(200).json({user: userUpdated});
			}
		}
	});
}

function uploadImage(req,res){
	var userId = req.params.id;
	var file_name = "No subido..."

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId,{image: file_name}, (err,userUpdated)=>{
				if(err){
					res.status(500).json({message: 'Error al actualizar el usuario'});
				}else{
					if(!userUpdated){
						res.status(404).json({message: 'El usuario no ha podido loguearse'});
					}else{
						res.status(200).json({user: userUpdated,image: file_name});
					}
				}
			})
		}

		console.log(file_path)
		//res.status(200).send({message: "image upload success"})
	}else{
		res.status(200).send({message: "no ha subido ninguna imagen"})
	}
}

function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file))
		}else{
			res.status(200).send({message: 'No existe la imagen...'})
		}
	})
}

module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};