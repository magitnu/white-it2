function WhiteItViewModel() {
	var self = this;
	self.pages = ['AllLinks', 'LinkDetail'];
	self.boxes = ['Empty', 'Register', 'NewLink'];
	
	self.user = ko.observable();
	self.password = ko.observable();
	
	self.entries = ko.observable();
	
	self.currentPage = ko.observable();
	self.currentEntry = ko.observable();
	self.showBox = ko.observable();
	
	self.showPage = function(page) {
		location.hash = page;
	};
	
	self.showBox = function(box) {
		//TODO
	};
	
	self.vote = function(entryId, vote) {
		$.post("/entry/"+entryId+"/"+vote, {id: entryId});
		$.get("/entries", self.entries);
	};
	
	self.login = function() {
		$.post("/login", {name: self.user, password: self.password});
	}
	
	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
		});
		
		this.get('#:page/:entry', function() {
			self.currentPage(this.params.page);
			self.currentEntry(this.params.entry);
		});
		
		//default path
        this.get('', function() { 
        	this.app.runRoute('get', '#AllLinks');
			$.get("/entries", self.entries)
    	});
	}).run();
}
ko.applyBindings(new WhiteItViewModel());