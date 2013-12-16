var express = require('express');
var User = require('./user.js');
var Link = require('./link.js');
var Comment = require('./comment.js');
var http = require('http');
var io = require('socket.io');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

var app = express();
app.use(allowCrossDomain);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: '2234567890QWERTY'}));
app.use(app.router);


function checkAuth(req, res, next) {
    if (typeof(req.session.user_id) == "number") {
        next();
    } else {
        res.send('You are not authorized!');
    }
}

var entries = [];
var users = [];
var comments = [];

//sample data
entries.push(new Link(entries.length, "Title", "Author", "http://www.google.ch"));
var comment = new Comment(0, "Super Kommentar, denn hier entsteht ein super Fuelltext", "Der Dort");
var comment2 = new Comment(1, "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet", "Test person");
comments.push(comment);
comments.push(comment2);
entries[0].comments.push(comment);
entries[0].comments.push(comment2);

entries.push(new Link(entries.length, "DaDadu", "Hans Peter", "http://www.9gag.com"));
var comment3 = new Comment(2, "Etwas Abwechslung ist auch immer gut...", "Mal Jemand");
var comment4 = new Comment(3, "TestComment2: Endlich passiert hier mal etwas", "Tom Koch");
comments.push(comment3);
comments.push(comment4);
entries[1].comments.push(comment);
entries[1].comments.push(comment2);

//default user
users.push(new User(users.length, "a", "a") );
  
function findUser(name)
{
	for (var i in users) 
	{
	   var user = users[i];
	   if( user.name == name)
	   {
		   return user;
	   }
	}
	return null;
}

function returnIndex(res, id, array) {
    if (array.length <= id || id < 0) {
        res.statusCode = 404;
        return res.send('Error 404: No entry found');
    }
    return res.json(array[id]);
}

//app.get('/', function(req, res) {
//  res.type('text/plain'); 
//  res.json(entries);
//});
 
app.get('/login', function (req, res) {
    if (typeof (req.session.user_id) == "number") {
        res.json(users[req.session.user_id].name);
        return;
    }
    res.json("");
});
 
 app.post('/login', function (req, res) {
    var post = req.body;  
	var user = findUser(post.name);	 
	if( !!user && post.password == user.password)
	{		
		req.session.user_id = user.id;		
		res.json(true);		
		return;
	}	
	res.json(false);
});

 app.post('/register', function(req, res) {
     var post = req.body;
     
     if (typeof(post.name) != "string" || typeof(post.password) != "string") {
         res.json(false);
         return;
     }
     
     if (findUser(post.name)) {
         res.json(false);
         return;
     }
     
     var newUser = new User(users.length, post.name, post.password);
     users.push(newUser);
     req.session.user_id = newUser.id;
     res.json(true);
 });
 
 app.get('/users', function (req, res) {
     res.json(users);
 });

 
 
 app.get('/entries', function (req, res) {
    res.json(entries);
});


app.post('/entry', function(req, res) {
    var newLink = new Link(entries.length, req.body.title, users[req.session.user_id].name, req.body.url);	
 	entries.push(newLink);
 	res.json(newLink);
 	io.sockets.emit('message', { action: "AddLink", entryId: newLink.id });
});

app.get('/entry/:id', function(req, res) {
   returnIndex(res,  req.params.id, entries);
});

app.post('/entry/:id/up', checkAuth, function (req, res) {
    res.json(entries[req.params.id].rating._up(users[req.session.user_id].name));
    io.sockets.emit('message', { action: "Rated", entryId: req.params.id });
});

app.post('/entry/:id/down', checkAuth, function (req, res) {
    res.json(entries[req.params.id].rating._down(users[req.session.user_id].name));
    io.sockets.emit('message', { action: "Rated", entryId: req.params.id });
});

app.post('/entry/:id/comment', checkAuth, function (req, res) {
    var newComment = new Comment(comments.length, req.body.text, users[req.session.user_id].name);
    comments.push(newComment);

    var entry = entries[req.params.id];
    entry.comments.push(newComment);
    res.json(newComment);
    io.sockets.emit('message', { action: "AddComment", entryId: req.params.id });
});

app.post('/comment/:id/', checkAuth, function (req, res) {
    var newComment = new Comment(comments.length, req.body.text, users[req.session.user_id].name);
    comments.push(newComment);

    var comment = comments[req.params.id];
    comment.comments.push(newComment);
    res.json(newComment);
    io.sockets.emit('message', { action: "AddComment", entryId: req.params.id });
});

app.post('/comment/:id/up', checkAuth, function (req, res) {
    res.json(comments[req.params.id].rating._up(users[req.session.user_id].name));
//    res.json(comments[req.params.id].rating._up(req.session.user_id));
    io.sockets.emit('message', { action: "Rated", entryId: req.params.id });
});

app.post('/comment/:id/down', checkAuth, function (req, res) {
    res.json(comments[req.params.id].rating._down(users[req.session.user_id].name));
    io.sockets.emit('message', { action: "Rated", entryId: req.params.id });
});

app.post('/logout', function (req, res) {
	req.session.user_id  = null;	
	res.json(true);
});

app.use('/', express.static(__dirname + '/public/'));

//socket:
io = io.listen(app.listen(process.env.PORT || 4730));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { action: 'connected' });
});

io.sockets.on('disconnect', function (socket) {
    socket.emit('message', { action: 'disconnect' });
});



