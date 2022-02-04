import { useEffect, useState } from 'react';
import Header from './components/Header';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dotenv from  'dotenv'
const api_base = 'http://localhost:3001';

require('dotenv').config()
const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

function App() {
	const [workouts, setWorkouts] = useState([]);
	const [popupActive, setPopupActive] = useState(false);
	const [popupActive2, setPopupActive2] = useState(false);
	const [newDate, setNewDate] = useState(new Date());
	const [newExercise, setNewExercise] = useState("");
	const [newType, setnewType] = useState("");
	const [newSet, setnewSet] = useState("");
	const [newReps, setnewReps] = useState("");
	const [currId, setNewID] = useState("");
	const [oldDate, setOldDate] = useState(new Date());
	const [lastSent, setLastSent] = useState(new Date());
	const GetWorkouts = () => {
		fetch(api_base + '/gym')
			.then(res => res.json())
			.then(data => setWorkouts(data))
			.catch((err) => console.error("Error: ", err));
	}

	useEffect(() => {
		const date1 = new Date();
		const diffTime1 = Math.abs(date1 - oldDate);
		const diffDays1 = Math.ceil(diffTime1 / (1000 * 60 * 60 * 24));
		let diffTime2 = Math.abs(date1 - lastSent);
		let diffDays2 = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24));
		if(diffDays1 > 5 && diffDays2 > 1){
			sendText();
			setLastSent(new Date());
			diffTime2 = Math.abs(date1 - lastSent);
			diffDays2 = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24));
		}
		GetWorkouts();
	});

	const sendText = async () => {
		await fetch(api_base + '/send-text');
	}
	const addExercise = async () => {
		const month = newDate.getMonth()+1;
		const set = (newSet.length === 0 ? "0" : newSet)
		const rep = (newReps.length === 0 ? "0" : newReps)
		const data = await fetch(api_base + "/gym/new", {
			method: "POST",
			headers: {
				"Content-Type": "application/json" 
			},
			body: JSON.stringify({
				text: newExercise,
				type: newType,
				date: month + '/' + newDate.getDate() + '/' + newDate.getFullYear(),
				sets: set,
				reps: rep,
			})
		}).then(res => res.json());

		setOldDate(new Date());
		setWorkouts([...workouts,data]);
		setPopupActive(false);
		setNewDate(new Date());
		setNewExercise("");
		setnewType("");
		setnewSet("");
		setnewReps("");
	}

	const deleteWorkout = async id =>{
		const data = await fetch(api_base + '/gym/delete/' + id,
		{method: "DELETE"
		}).then(res => res.json());
		setWorkouts(workouts => workouts.filter(workout => workout._id !== data.result._id));
	}

	const addWorkout = async id =>{
			const data = await fetch(api_base + "/gym/update/" + id, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json" 
			},
			body: JSON.stringify({
				text: newExercise,
				type: newType,
				reps: newReps,
				sets: newSet
			})
		}).then(res => res.json());
		const data2 = await fetch(api_base + "/gym/new", {
			method: "POST",
			headers: {
				"Content-Type": "application/json" 
			},
			body: JSON.stringify({
				text: data.text,
				type: data.type,
				date: data.date,
				sets: newSet,
				reps: newReps
			})
		}).then(res => res.json());
		setWorkouts([...workouts,data2]);
		deleteWorkout(id);
		
		
		setPopupActive2(false);
		setNewDate(new Date());
		setNewExercise("");
		setnewType("");
		setnewSet("");
		setnewReps("");
		
	}
	  
	return (
		<div className="App">
			<Header/>
			<div className = "workouts">
				{workouts.length > 0 ? workouts.map(workout => (
					<div className = "workout" key = {workout._id}>
						<div className="container">
						<div className = "date"><h4>{workout.date}</h4></div>
						<div className = "text"><pre>{workout.text}</pre></div>
						<div className = "type"> <pre>{workout.type} </pre> </div>
						</div>
						<div className="add-workout" onClick={() => {setPopupActive2(true); setNewID(workout._id)}}>Add Exercise</div>
			{popupActive2 ? (
				<div className="popup">
					<div className="closePopup" onClick={() => setPopupActive2(false)}>X</div>
					<div className="content">
						<h3>Add Exercise</h3>
						<input type="text" placeholder="Exercise" id = "exercise"className="add-todo-exercise" onChange={e => setNewExercise(e.target.value)} value={newExercise} />
						<input type="text" placeholder="Weight" id = "type" className="add-todo-exercise" onChange={e => setnewType(e.target.value)} value={newType} />
						<input type="text" placeholder="Sets" id = "sets"className="add-todo-reps" onChange={e => setnewSet(e.target.value)} value={newSet} />
						<input type="text" placeholder="Reps" id = "reps" className="add-todo-reps" onChange={e => setnewReps(e.target.value)} value={newReps} />
						<div className="button" onClick={() => addWorkout(currId)}>Create Exercise</div>
					</div>
				</div>
			) : ''}
						<div className="delete-workout" onClick={() => deleteWorkout(workout._id)}>x</div>
					</div>
				)) : (
					<h4>Get started tracking your workout!</h4>
				)}
			</div>
			<div className="addPopup" onClick={() => setPopupActive(true)}>+</div>
			{popupActive ? (
				<div className="popup">
					<div className="closePopup" onClick={() => setPopupActive(false)}>X</div>
					<div className="content">
						<h3>Add Workout</h3>
						{/* <input type="text" placeholder="Date" id = "date" className="add-todo-exercise" onChange={e => setNewDate(e.target.value)} value={newDate} /> */}
						<DatePicker id = "datePicker" selected={newDate} onChange={(date) => setNewDate(date)} />
						<input type="text" placeholder="Exercise" id = "exercise"className="add-todo-exercise" onChange={e => setNewExercise(e.target.value)} value={newExercise} />
						<input type="text" placeholder="Weight" id = "type" className="add-todo-exercise" onChange={e => setnewType(e.target.value)} value={newType} />
						<input type="text" placeholder="Sets" id = "sets"className="add-todo-reps" onChange={e => setnewSet(e.target.value)} value={newSet} />
						<input type="text" placeholder="Reps" id = "reps" className="add-todo-reps" onChange={e => setnewReps(e.target.value)} value={newReps} />
						<div className="button" onClick={addExercise}>Create Workout</div>
					</div>
				</div>
			) : ''}
		</div>
	



	);
}

export default App;