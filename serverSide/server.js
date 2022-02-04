const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const twilio = require('twilio'); 
const app = express();
const accountSid = 'AC27da1fdffbe4b8bd2623c9e34758b4d3';
const authToken = 'dff48a45bb8b49f60c6c9878d1807c84'; 
const client = new twilio(accountSid, authToken);
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/gymTracker', {
	useNewUrlParser: true, 
	useUnifiedTopology: true 
}).then(() => console.log("Connected to MongoDB")).catch(console.error);

// Models
const Todo = require('./models/Tracker');

app.get('/gym', async (req, res) => {
	const todos = await Todo.find();

	res.json(todos);
});

app.post('/gym/new', (req, res) => {
	const todo = new Todo({
		text: req.body.text + " (" + req.body.sets + "x" + req.body.reps + ")",
		type: req.body.type + " lbs",
		date: req.body.date,
	})
	
	todo.save();

	res.json(todo);
});

app.get('/gym/complete/:id', async (req, res) => {
	const todo = await Todo.findById(req.params.id);

	todo.complete = !todo.complete;

	todo.save();

	res.json(todo);
})


app.delete('/gym/delete/:id', async (req, res) => {
	const result = await Todo.findByIdAndDelete(req.params.id);

	res.json({result});
});

app.put('/gym/update/:id', async (req, res) => {
	const todo = await Todo.findById(req.params.id);
	while(todo.text.length < todo.type.length){
		todo.text += " ";
	}
	while(todo.text.length > todo.type.length){
		todo.type += " ";
	}
	const sets = req.body.sets;
	const reps = req.body.reps;
	todo.text += "|" + req.body.text;
	todo.type += "|" + req.body.type;
	todo.save();

	res.json(todo);
});

app.get('/send-text', (req, res) => {



    //Send Text
    client.messages.create({
        body: "You haven't logged a workout in 5 days",
        to: '7034381566',  // Text this number
        from: '+16165778147' // From a valid Twilio number
    }).then((message) => console.log(message.body));
})

app.listen(3001);