function WhiteItViewModel() {
	var self = this;

	// Define observable Variables
	self.entries = ko.observableArray([]);
	self.currentPage = ko.observable(); // 'AllLinks', 'LinkDetail'
	self.currentEntry = ko.observable();
	self.currentBox = ko.observable(); // 'Empty', 'Register', 'NewLink', 'NewComment'
	self.currentUser = ko.observable();
	self.currentMessage = ko.observable();
	self.currentMessageType = ko.observable();
	self.newUsername = ko.observable();
	self.newPassword = ko.observable();
	self.newPasswordRepeat = ko.observable();
	self.name = ko.observable();
	self.password = ko.observable();

	// Notifications
	self.addMessage = function(msg) {
		self.clearMessagesIn(0);
		self.currentMessage(msg.text);
		self.currentMessageType(msg.css);
		self.clearMessagesIn(20);
	};

	self.clearMessagesIn = function(wait) {
		if (wait == 0) {
			self.currentMessage('');
			self.currentMessageType('');
		} else {
			setTimeout(function() {
				self.currentMessage('');
				self.currentMessageType('');
			}, wait * 1000);
		}
	};

	// Show Site Elements
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

	self.loadCurrentUser = function(data) {
		$.get("/login", {}, function(res) {
			self.currentUser(res);
		});
	};

	// Voting
	self.vote = function(entryId, vote) {
		if (self.currentUser() != '') {
			$.post("/entry/" + entryId + "/" + vote);
			if (self.currentPage() == 'AllLinks') {
				self.loadEntries();
			} else {
				self.loadEntry(entryId);
			}
		}
	};

	self.voteComment = function(commentId, vote) {
		if (self.currentUser() != '') {
			$.post("/comment/" + commentId + "/" + vote);
			self.loadEntry(self.currentEntry().id);
		}
	};

	self.getVoteImg = function(entry, vote) {
		var upIndex = entry.rating.upVoters.indexOf(self.currentUser());
		var downIndex = entry.rating.downVoters.indexOf(self.currentUser());
		if (vote == 'up') {
			if (upIndex > -1) {
				return '/images/upVote.png';
			}
			return '/images/upVoteBlank.png';
		} else {
			if (downIndex > -1) {
				return '/images/downVote.png';
			}
			return '/images/downVoteBlank.png';
		}
	}

	self.viewLinkDetail = function(entryId) {
		location.hash = "LinkDetail/" + entryId;
	};

	// Register
	self.register = function() {
		if (self.newPassword() != self.newPasswordRepeat())
			self.addMessage({
				text : "Passwords do not match",
				css : 'error'
			});
		else {
			$
					.post(
							"/register",
							{
								name : self.newUsername(),
								password : self.newPassword()
							},
							function(success) {
								if (success) {
									self
											.addMessage({
												text : "You have been successfuly registered.",
												css : 'info'
											});
									self.newUsername('');
									self.newPassword('');
									self.newPasswordRepeat('');
									self.loadCurrentUser();
									self.closeBox();
								} else {
									self
											.addMessage({
												text : "There was a problem with your registration. Probably the username has already been choosen.",
												css : 'error'
											});
								}
								self.loadEntries();
							});
		}
	};

	// Login/Logout
	self.login = function() {
		$.post("/login", {
			name : self.name(),
			password : self.password()
		}, function(res) {
			if (res) {
				$.get("/login", {}, function(res) {
					self.currentUser(res);
					self.addMessage({
						text : 'Welcome back, ' + res + '!',
						css : 'info'
					});
				});
				self.name('');
				self.password('');
				self.loadCurrentUser();
				self.showBox(null);
			} else
				self.addMessage({
					text : "Username and password do not match",
					css : 'warning'
				});
		});
	};

	self.logout = function() {
		$.post("/logout", {}, function() {
			self.addMessage({
				text : "See you soon, " + self.currentUser() + "!",
				css : 'info'
			});
			self.loadCurrentUser();
		});
	};

	self.closeBox = function() {
		self.showBox(null);
	};

	// New Link
	self.newLinkTitle = ko.observable();
	self.newLinkUrl = ko.observable();
	self.createLink = function() {
		$.post("/entry", {
			title : self.newLinkTitle(),
			url : self.newLinkUrl()
		}, function(res) {
			self.closeBox();
			self.addMessage({
				text : "Thank you for your Link",
				css : 'info'
			});
			self.newLinkTitle('');
			self.newLinkUrl('');
			self.viewLinkDetail(res.id);
		});
	};

	// New Comment
	self.newLinkComment = ko.observable();
	self.createComment = function() {
		$.post("/entry/" + self.currentEntry().id + "/comment", {
			text : self.newLinkComment()
		}, function() {
			self.closeBox();
			self.addMessage({
				text : "Thank you for your comment",
				css : 'info'
			});
			self.newLinkComment('');
			self.loadEntry(self.currentEntry().id);
		});
	};

	// Init
	self.loadCurrentUser();
	self.currentMessage('');
	self.currentMessageType('');

	// Sammy.js
	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
			self.loadEntries();
			self.showBox(null);
		});

		this.get('#:page/:entryId', function() {
			self.currentPage(this.params.page);
			self.loadEntry(this.params.entryId);
			self.showBox(null);
		});

		// default path
		this.get('', function() {
			this.app.runRoute('get', '#AllLinks');
		});
	}).run();
}

ko.bindingHandlers.fadeVisible = {
	init : function(element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on
		// the value
		var value = valueAccessor();
		ko.unwrap(value) ? $(element).slideDown(400) : $(element).hide();
	},
	update : function(element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in
		// or out
		var value = valueAccessor();
		ko.unwrap(value) ? $(element).slideDown(400) : $(element).slideUp(
				"slow");
	}
};

// create viewModel and apply bindings
var viewModel = new WhiteItViewModel();
ko.applyBindings(viewModel);

// Socket.io
var socket = io.connect('/');

socket.on('message', function(param) {
	switch (param.action) {
	case 'AddLink':
		if (viewModel.currentPage() == 'AllLinks') {
			viewModel.loadEntries();
		}
		break;
	case 'Rated':
		if (viewModel.currentPage() == 'AllLinks') {
			viewModel.loadEntries();
		} else if (viewModel.currentEntry().id == param.entryId) {
			viewModel.loadEntry(param.entryId);
		}
		break;
	case 'AddComment':
		if (viewModel.currentPage() == 'AllLinks') {
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