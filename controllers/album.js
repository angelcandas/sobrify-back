'use strict'

var path = require('path');
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')
var Artist = require('../models/artist')
var Album = require('../models/album')
var Song = require('../models/song')
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/albums'});

function getAlbum(req,res){
	var albumId=req.params.id;
	Album.findById(albumId).populate({path: 'artist'}).exec((err,album)=>{
		if (err) {
			res.status(500).send({message:"Error en el servidor"})
		} else {
				if (!album) {
				res.status(404).send({message:"Album no encontrado"})
			} else {
				res.status(200).send({album})
			}
		}


	})
}

function getAlbums(req,res){
	var artistId=req.params.artist;
	if (!artistId) {
		var find = Album.find({}).sort('title');
	} else {
		var find = Album.find({artist: artistId}).sort('year');
	}

	find.populate({path: 'artist'}).exec((err,albums)=>{
		if (err) {
			res.status(500).send({message:"Error en el servidor"})
		} else {
			if (err) {
				res.status(404).send({message: "No hay albums"})
			} else {
				res.status(200).send({albums})
			}
		}
	})
}


function saveAlbum(req,res){
	var album = new Album();
	var params = req.body;
	album.description = params.description;
	album.title = params.title;
	album.year = params.year;
	album.image = 'null';
	album.artist = params.artist;

	album.save((err,albumStored)=>{
		if(err){
			res.status(500).send({message:"Error en el servidor"})
		}else {
			if(!albumStored){
				res.status(404).send({message:"Hola no se ha guardado el album"})   
			}else{
				res.status(200).send({albumStored})
			}
		}
	})
}

function updateAlbum(req,res){
	var albumId = req.params.id;
	var update = req.body;

	Album.findByIdAndUpdate(albumId,update,(err,albumUpdated)=>{
		if(err){
			res.status(500).send({message:"Error en el servidor"})
		}else{
			if (!albumUpdated) {
				res.status(404).send({message:"Error 404 no se ha encontrado el album"})
			} else {
				res.status(200).send({albumUpdated})
			}
		}
	})
}
function deleteAlbum(req,res){
	var albumId = req.params.id;
			Album.findByIdAndDelete(albumId,(err,albumRemoved)=>{
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
							res.status(200).send({albumRemoved})
						}
					}
				})
				}
			}
		})
}

function uploadImage(req,res){
	var albumId = req.params.id;
	var file_name = "No subido..."

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			Album.findByIdAndUpdate(albumId,{image: file_name}, (err,albumUpdated)=>{
				if(err){
					res.status(500).json({message: 'Error al actualizar el album'});
				}else{
					if(!albumUpdated){
						res.status(404).json({message: 'El album no ha podido loguearse'});
					}else{
						res.status(200).json({albumUpdated});
					}
				}
			})
		}else{
			res.status(500).json({message: "no ha subido ninguna imagen"})
		}
		//res.status(200).send({message: "image upload success"})
	}else{
		res.status(200).send({message: "no ha subido ninguna imagen"})
	}
}
function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/albums/'+imageFile;
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file))
		}else{
			res.status(200).send({message: 'No existe la imagen...'})
		}
	})
}


module.exports={
	getAlbum,
	saveAlbum,
	getAlbums,
	updateAlbum,
	deleteAlbum,
	uploadImage,
	getImageFile
}