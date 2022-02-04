const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
	text: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required:false,
		default: 'unknown'

	},
	type: {
		type: String,
		required:true
	},
	reps:{
		type: String,
		required:false,
	},
	sets:{
		type: String,
		required:false,
	},
	complete: {
		type: Boolean,
		default: false
	},
	timestamp: {
		type: String,
		default: Date.now()
	}
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;