module.exports = function Rating() {
    this.value = 0;
    this.upVoters = [];
    this.downVoters = [];
    var self = this;
    
    this._up = function(userId) {
    	var upIndex = self.upVoters.indexOf(userId);
    	var downIndex = self.downVoters.indexOf(userId);
    	
        if (upIndex == -1 && downIndex == -1) {
            self.value++;
            self.upVoters.push(userId);
        } else if (upIndex == -1 && downIndex > -1) {
        	self.value++;
        	self.downVoters.splice(downIndex, 1);
        }
        return self.value;
    };
    
    this._down = function (userId) {
    	var upIndex = self.upVoters.indexOf(userId);
    	var downIndex = self.downVoters.indexOf(userId);
    	
        if (downIndex == -1 && upIndex == -1) {
            self.value--;
            self.downVoters.push(userId);
        } else if (downIndex == -1 && upIndex > -1) {
        	self.value--;
        	self.upVoters.splice(upIndex, 1);
        }
        return self.value;
    };
};