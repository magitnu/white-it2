function WhiteItViewModel() {
	var self = this;
	self.pages = [ 'AllLinks', 'LinkDetail' ];
	self.boxes = [ 'Empty', 'Register', 'NewLink' ];

	self.entries = ko.observable();

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

	//Login/Logout
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
	
	//New Link
	self.newLinkTitle = "";
	self.newLinkUrl = "";
	self.createLink = function() {
		$.post("/entry", {title: self.newLinkTitle, url: self.newLinkUrl}, self.loadEntries());
	};

	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
		});

		this.get('#:page/:entry', function() {
			self.currentPage(this.params.page);
            $.get("/entry/" + this.params.entry, { id: this.params.entry }, self.currentEntry);
		});

		// default path
		this.get('', function() {
			this.app.runRoute('get', '#AllLinks');
			self.loadEntries();
		});
	}).run();
}
ko.applyBindings(new WhiteItViewModel());