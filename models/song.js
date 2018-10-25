'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongSchema = Schema({
	name: String,
	number: Number,
	duration: Number,
	file: String,
	album: {type: Schema.ObjectId, ref: 'Album'},
});

module.exports = mongoose.model('Song',SongSchema)