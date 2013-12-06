function WhiteItViewModel() {
	var self = this;
	var pages = ['AllLinks', 'LinkDetail'];
	var boxes = ['Empty', 'Register', 'NewLink'];

	self.currentPage = ko.observable();
	self.currentEntry = ko.observable();
	self.showBox = ko.observable();
	
	self.showPage = function(page) {
		location.hash = page;
	};
	
	self.showBox = function(box) {
		//TODO
	};
	
	Sammy(function() {
		this.get('#:page', function() {
			self.currentPage(this.params.page);
			self.currentEntry(null);
		});
		
		this.get('#:page/:entry', function() {
			self.currentPage(this.params.page);
			self.currentPage(this.params.entry);
		});
		
		//default path
        this.get('', function() { 
        	this.app.runRoute('get', '#AllLinks'); 
    	});
	});
}
ko.applyBindings(new WhiteItViewModel());