function WhiteItViewModel() {
	var self = this;
	self.pages = [ 'AllLinks', 'LinkDetail' ];
	self.boxes = [ 'Empty', 'Register', 'NewLink', 'NewComment'];

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

	self.loadEntries = function() {
		$.get("/entries", self.entries);
	};

	//voting
	self.vote = function(entryId, vote) {
		$.post("/entry/" + entryId + "/" + vote);
		if(self.currentPage() == 'AllLinks') {
			self.loadEntries();
		} else {
			self.getEntry(entryId);
		}
	};
	
	self.getVoteImg = function(entry, vote) {
    	var upIndex = entry.rating.upVoters.indexOf(entry.id);
    	var downIndex = entry.rating.downVoters.indexOf(entry.id);
    	if(vote == 'up'){
    		if(upIndex > -1){
    			return 'images/upVote.png';
    		}
    		return 'images/upVoteBlank.png';
    	} else {
    		if(downIndex > -1){
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
	
	self.getEntry = function(entryId) {
		$.get("/entry/" + entryId, {}, function(data) {
			self.currentEntry(data);
		});
	};

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
	
	//Register
	self.newUsername = "";
	self.newPassword = "";
	self.register = function() {
		$.post("/register", {
			name : self.newUsername,
			password : self.newPassword
		}, function(success) {
			if(success)
				self.closeBox();
			self.loadEntries();
		});
	};
	
	//New Comment
	self.newLinkComment = "";
	self.createComment = function() {
		$.post("/entry/" + self.currentEntry().id + "/comment", {
			text : self.newLinkComment
		}, function() {
			self.closeBox();
			self.getEntry(self.currentEntry().id);
		});
	};
	
	//Init
	self.getCurrentUser();
	self.currentBox(null);

	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
			if(self.currentBox() == 'NewComment')
				self.showBox(null);
		});

		this.get('#:page/:entryId', function() {
			self.currentPage(this.params.page);
			self.getEntry(this.params.entryId);
			//self.loadEntries();
			//$.get("/entry/" + this.params.entryId, self.currentEntry);
		});

		// default path
		this.get('', function() {
			this.app.runRoute('get', '#AllLinks');
			self.loadEntries();
		});
	}).run();
}
ko.applyBindings(new WhiteItViewModel());