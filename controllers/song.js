'use strict'

var path = require('path');
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')
var Artist = require('../models/artist')
var Album = require('../models/album')
var Song = require('../models/song')

this.getSong = (req,res) =>{
	var songId = req.params.id;
	console.log(songId)
	Song.findById(songId).populate({path: 'album',populate:{path: 'artist',model:'Artist'}}).exec((err,song)=>{
		if (err) {
			res.status(500).send({message:"Server error"})
		}else{
			if (!song) {
				res.status(404).send({message:"Error 404 no se encuentra la cancion"})
			} else {
				res.status(200).send({song})
			}
		}
	});
}

this.saveSong = (req,res) =>{
	var song = new Song();

	var params = req.body;
	song.name = params.name;
	song.number = params.number;
	song.duration = params.duration;
	song.file = 'null';
	song.album = params.album;
	song.save((err,songStored)=>{
		if(err){
			res.status(500).send({message:"Server error"})
		}else{
			if(!songStored){
				res.status(404).send({message:"Song not saved"})
			}else{
				res.status(200).send({song: songStored})
			}
		}
	})
}

function updateSong(req,res){
	var songId = req.params.id;
	var update = req.body;
	Song.findByIdAndUpdate(songId,update,(err,songUpdated)=>{
		if(err){
			res.status(500).send({message:"Server error"})
		}else{
			if(!songUpdated){
				res.status(404).send({message:"Song not saved"})
			}else{
				res.status(200).send({song: songUpdated})
			}
		}
	})
}

function getSongs(req,res){
	var albumId = req.params.album;
	if(!albumId){
		var find = Song.find({}).sort('number')
	}else{
		var find = Song.find({album: albumId}).sort('number')
	}

	find.populate({
		path: 'album',
		populate: {
			path: 'artist',
			model: 'Artist'
		}
	}).exec((err,song)=>{
		if(err){
			res.status(500).send({message:"Server error"})
		}else{
			if(!song){
				res.status(404).send({message:"Song not saved"})
			}else{
				res.status(200).send({song: song})
			}
		}
	})
}

function deleteSong(req,res){
	var songId = req.params.id;
	Song.findByIdAndRemove(songId,(err,song)=>{
		if(err){
			res.status(500).send({message:"Server error"})
		}else{
			if(!song){
				res.status(404).send({message:"Song not deleted"})
			}else{
				res.status(200).send({song: song})
			}
		}
	})
}

function uploadSong(req,res){
	var songId = req.params.id;
	var file_name = "No subido..."

	if(req.files){
		var file_path = req.files.file.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'mp3' || file_ext == 'wav' || file_ext == 'ogg'){
			Song.findByIdAndUpdate(songId,{file: file_name}, (err,songUpdated)=>{
				if(err){
					res.status(500).json({message: 'Error al actualizar el artista'});
				}else{
					if(!songUpdated){
						res.status(404).json({message: 'El artista no ha podido loguearse'});
					}else{
						res.status(200).json({songUpdated});
					}
				}
			})
		}

		console.log(file_path)
		//res.status(200).send({message: "image upload success"})
	}else{
		res.status(200).send({message: "no ha subido ninguna cancion"})
	}
}

function getSongFile(req,res){
	var audioFile = req.params.audioFile;
	var path_file = './uploads/songs/'+audioFile;
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file))
		}else{
			res.status(200).send({message: 'No existe la cancion...'})
		}
	})
}

module.exports = {
	getSong: this.getSong,
	saveSong: this.saveSong,
	updateSong,
	getSongs,
	deleteSong,
	uploadSong,
	getSongFile
}