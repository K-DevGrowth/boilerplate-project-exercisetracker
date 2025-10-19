const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

let users = [];
let exercises = [];

const generateId = () => (Math.random() + 1).toString(36).substring(2, 10);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;

  const user = {
    username: username,
    _id: generateId(),
  };

  users.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const id = req.params._id;

  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    username: users.find((user) => user._id === id).username,
    description: description.toString(),
    duration: Number(duration),
    date: exerciseDate.toDateString(),
    _id: id,
  };

  exercises = exercises.concat(exercise);

  res.json(exercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  const user = users.find((user) => user._id === id);
  let userExercises = exercises.filter((e) => e._id === id);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) >= fromDate
    );
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) <= toDate
    );
  }

  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  const log = userExercises.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date,
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
