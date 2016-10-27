const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const app = express();



// db

mongoose.connect('mongodb://localhost/todosDb');
autoIncrement.initialize(mongoose);
var Todo;

var db = mongoose.connection;
db.once('open', function() {
    var todoSchema = mongoose.Schema({
        todoId: Number,
        text: String,
        state: Number,
        toDate: Date
    });

    todoSchema.plugin(autoIncrement.plugin, {
        model: 'Todo',
        field: 'todoId',
        startAt: 1
    });

    Todo = mongoose.model('Todo', todoSchema);

    // server start
    app.listen(3000, function() {
        console.log('listening on 3000');
    });
});



// CRUD

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/todos', function(req, res) {
    Todo.find(function(err, results) {
        res.send(results);
    });
});

app.get('/api/todos/:id', function(req, res) {
    var id = parseInt(req.params.id);
    Todo.findOne({ todoId: id }, function(err, results) {
        res.send(results);
    });
});

app.post('/api/todos', function(req, res) {
    if (req.body.text === '' || req.body.toDate === '') {
        res.status(422).send('Invalid parameters');
        return;
    }
    var t = new Todo({
        text: req.body.text,
        state: 0,
        toDate: req.body.toDate
    });
    t.save(function(err, user) {
        if (err) {
            res.status(422).send('Error');
        } else {
            res.send('Saved successfully');
        }
    });
});

app.delete('/api/todos/:id', function(req, res) {
    var id = parseInt(req.params.id);
    Todo.findOne({ todoId: id }, function(err,todo) {
        if (err) {
            res.send('Error');
        } else if (todo) {
            Todo.remove({ todoId: id }, function(err,removed) {
                if (err) {
                    res.send('Error');
                } else {
                    res.send('Deleted successfully');
                }
            });
        } else {
            res.send('Nothing to delete');
        }
    });
});