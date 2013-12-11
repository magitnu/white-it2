function WhiteItViewModel() {
	var self = this;
	self.pages = [ 'AllLinks', 'LinkDetail' ];
	self.boxes = [ 'Empty', 'Register', 'NewLink', 'NewComment' ];

	self.entries = ko.observableArray([]);

	self.currentPage = ko.observable();
	self.currentEntry = ko.observable();
	self.currentBox = ko.observable();
	self.currentUser = ko.observable();

	self.showPage = function(page) {
		location.hash = page;
	};

	self.showBox = function(box) {
		self.currentBox(box);
	};

	// load Server Data
	self.loadEntries = function() {
		$.get("/entries", self.entries);
	};

	self.loadEntry = function(entryId) {
		$.get("/entry/" + entryId, {}, function(data) {
			self.currentEntry(data);
		});
	};

	// voting
	self.vote = function(entryId, vote) {
		$.post("/entry/" + entryId + "/" + vote);
		if (self.currentPage() == 'AllLinks') {
			self.loadEntries();
		} else {
			self.loadEntry(entryId);
		}
	};

	self.getVoteImg = function(entry, vote) {
		var upIndex = entry.rating.upVoters.indexOf(self.currentUser());
		var downIndex = entry.rating.downVoters.indexOf(self.currentUser());
		if (vote == 'up') {
			if (upIndex > -1) {
				return 'images/upVote.png';
			}
			return 'images/upVoteBlank.png';
		} else {
			if (downIndex > -1) {
				return 'images/downVote.png';
			}
			return 'images/downVoteBlank.png';
		}
	}

	self.viewLinkDetail = function(entryId) {
		location.hash = "LinkDetail/" + entryId;
	};

	// Login/Logout
	self.name = "";
	self.password = "";

	self.login = function() {
		$.post("/login", {
			name : self.name,
			password : self.password
		}, self.getCurrentUser());
	};

	self.logout = function() {
		$.post("/logout", {}, self.getCurrentUser());
	};

	self.getCurrentUser = function(data) {
		$.get("/login", {}, function(res) {
			self.currentUser(res);
		});
	};

	self.closeBox = function() {
		self.showBox(null);
	};

	// New Link
	self.newLinkTitle = "";
	self.newLinkUrl = "";
	self.createLink = function() {
		$.post("/entry", {
			title : self.newLinkTitle,
			url : self.newLinkUrl
		}, function(res) {
			self.closeBox();
			self.viewLinkDetail(res.id);
		});
	};

	// Register
	self.newUsername = "";
	self.newPassword = "";
	self.register = function() {
		$.post("/register", {
			name : self.newUsername,
			password : self.newPassword
		}, function(success) {
			if (success)
				self.closeBox();
			self.loadEntries();
		});
	};

	// New Comment
	self.newLinkComment = "";
	self.createComment = function() {
		$.post("/entry/" + self.currentEntry().id + "/comment", {
			text : self.newLinkComment
		}, function() {
			self.closeBox();
			self.loadEntry(self.currentEntry().id);
		});
	};

	// Init
	self.getCurrentUser();
	self.currentBox(null);

	// Sammy.js
	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
			if (self.currentBox() == 'NewComment')
				self.showBox(null);
		});

		this.get('#:page/:entryId', function() {
			self.currentPage(this.params.page);
			self.loadEntry(this.params.entryId);
			// self.loadEntries();
			// $.get(�"/entry/" + this.params.entryId, self.currentEntry);
		});

		// default path
		this.get('', function() {
			this.app.runRoute('get', '#AllLinks');
			self.loadEntries();
		});
	}).run();
}

// create viewModel and apply bindings
var viewModel = new WhiteItViewModel();
ko.applyBindings(viewModel);

// Socket.io
var socket = io.connect('http://localhost:4730/');

socket.on('message', function(param) {
	switch (param.action) {
	case 'AddLink':
		if(viewModel.currentPage() == 'AllLinks') {
			viewModel.loadEntries();
		}
		break;
	case 'Rated':
		if(viewModel.currentPage() == 'AllLinks') {
			viewModel.loadEntries();
		} else if (viewModel.currentEntry().id == param.entryId) {
			viewModel.loadEntry(param.entryId);
		}
		break;
	case 'AddComment':
		if(viewModel.currentPage() == 'AllLinks') {
			viewModel.loadEntries();
		} else if (viewModel.currentEntry().id == param.entryId) {
			viewModel.loadEntry(param.entryId);
		}
		break;
	case 'connect':
		console.log(4);
		break;
	case 'disconnect':
		console.log(5);
		break;
	}
});