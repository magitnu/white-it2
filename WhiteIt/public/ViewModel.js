function WhiteItViewModel() {
	var self = this;
	self.pages = [ 'AllLinks', 'LinkDetail' ];
	self.boxes = [ 'Empty', 'Register', 'NewLink' ];

	self.entries = ko.observableArray([]);

	self.currentPage = ko.observable();
	self.currentEntry = ko.observable();
	self.currentBox = ko.observable();
	self.currentUser = ko.observable();

	self.currentBox(null);

	self.showPage = function(page) {
		location.hash = page;
	};

	self.showBox = function(box) {
		self.currentBox(box);
	};

	self.loadEntries = function() {
		$.get("/entries", self.entries);
	};

	self.vote = function(entryId, vote) {
		$.post("/entry/" + entryId + "/" + vote);
		self.loadEntries();
	};

	self.viewLinkDetail = function(entryId) {
		location.hash = "entry/" + entryId;
	};

	// Login/Logout
	self.name = "";
	self.password = "";

	// self.updateEntry = function(entryId) {
	// var entry = ko.utils.arrayFirst(self.entries(), function(currentEntry) {
	// return currentEntry.id == entryId;
	// });
	// if (entry) {
	// console.log(entry);
	// }
	// }

	self.getEntry = function(entryId) {
		$.get("/entry/" + entryId, self.currentEntry);
	}

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
		}, self.loadEntries());
	};
	
	//Register
	self.newUsername = "";
	self.newPassword = "";
	self.register = function() {
		$.post("/register", {
			name : self.newUsername,
			password : self.newPassword
		}, self.loadEntries());
	};

	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
		});

		this.get('#:page/:entryId', function() {
			self.currentPage(this.params.page);
			self.getEntry(this.params.entryId);
			self.loadEntries();
			// $.get("/entry/" + this.params.entryId, self.currentEntry);
		});

		// default path
		this.get('', function() {
			this.app.runRoute('get', '#AllLinks');
			self.loadEntries();
		});
	}).run();
}
ko.applyBindings(new WhiteItViewModel());