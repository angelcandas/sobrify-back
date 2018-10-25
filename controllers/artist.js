'use strict'

var path = require('path');
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')
var Artist = require('../models/artist')
var Album = require('../models/album')
var Song = require('../models/song')

function getArtist(req,res){
	var artistId = req.params.id;
	Artist.findById(artistId,(err,artist)=>{
		if(err){
			res.status(500).json({message: "Error en la peticion"})
		}else{
			if(!artist){
				res.status(404).json({message: "El artista no existe"})
			}
			else{
				res.status(200).json({artist})
			}
		}
	})

	//res.status(200).json({message: 'Metodo get artist del controlador'})
}

function getArtists(req,res){
	if (req.params.page) {
		var page = req.params.page;
	} else {
		var page = 1;
	}
	if(req.params.items){
		var itemsPerPage = req.params.items;
	} else{
		var itemsPerPage = 100;
	}
	
	var artistId = req.params.id;
	Artist.find().sort('name').paginate(page,itemsPerPage,(err,artists,total)=>{
		if(err){
			res.status(500).json({message: "Error en la peticion"})
		}else{
			if(!artists){
				res.status(404).json({message: "No hay artistas"})
			}
			else{
				res.status(200).json({
					artists: artists,
					totalItems: total
				})
			}
		}
	})

	//res.status(200).json({message: 'Metodo get artist del controlador'})
}


function saveArtist(req,res){
	var artist = new Artist();
	var params = req.body;
	artist.name = params.name;
	artist.description = params.description;
	artist.image = 'null';
	artist.save((err,artistStored)=>{
		if(err){
			res.status(500).json({message: 'Error al guardar el artista'});
		}else{
			if(!artistStored){
				res.status(404).send({message: 'El artista no ha sido guardado'})
			}else{
				res.status(200).send({artistStored})
			}
		}
	})
}

function updateArtist(req,res){
	var artistId = req.params.id;
	var update = req.body;
	Artist.findByIdAndUpdate(artistId,update,(err,artistUpdated)=>{
		if(err){
			res.status(500).json({message: 'Error al actualizar el artista'});
		}else{
			if(!artistUpdated){
				res.status(404).send({message: 'El artista no ha sido actualizado'})
			}else{
				res.status(200).send({artistUpdated})
			}
		}
	})
}


function deleteArtist(req,res){
	var artistId = req.params.id;
	Artist.findByIdAndDelete(artistId,(err,artistRemoved)=>{
		if(err){
			res.status(500).json({message: 'Error al eliminar el artista'});
		}else{
			if(!artistRemoved){
				res.status(404).send({message: 'El artista no ha sido eliminado'})
			}else{
				Album.find({artist: artistRemoved._id}).remove((err,albumRemoved)=>{
					if(err){
						res.status(500).json({message: 'Error al eliminar el album'});
					}else{
						if(!albumRemoved){
							res.status(404).send({message: 'El album no ha sido eliminado'})
						}else{
							Song.find({album: albumRemoved._id}).remove((err,songRemoved)=>{
							if(err){
								res.status(500).json({message: 'Error al eliminar la cancion'});
							}else{
								if(!songRemoved){
									res.status(404).send({message: 'La cancion no ha sido eliminada'})
								}else{
									res.status(200).send({artist: artistRemoved})
								}
							}
						})
						}
					}
				})
			}
		}
	})
}

function uploadImage(req,res){
	var artistId = req.params.id;
	var file_name = "No subido..."

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			Artist.findByIdAndUpdate(artistId,{image: file_name}, (err,artistUpdated)=>{
				if(err){
					res.status(500).json({message: 'Error al actualizar el artista'});
				}else{
					if(!artistUpdated){
						res.status(404).json({message: 'El artista no ha podido loguearse'});
					}else{
						res.status(200).json({artist: artistUpdated});
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
	var path_file = './uploads/artists/'+imageFile;
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file))
		}else{
			res.status(200).send({message: 'No existe la imagen...'})
		}
	})
}

module.exports ={
	getArtist,
	getArtists,
	saveArtist,
	updateArtist,
	deleteArtist,
	getImageFile,
	uploadImage
}