module.exports = function Rating() {
    this.value = 0;
    this.upVoters = [];
    this.downVoters = [];
    var self = this;
    
    this._up = function(userName) {
    	var upIndex = self.upVoters.indexOf(userName);
    	var downIndex = self.downVoters.indexOf(userName);
    	
        if (upIndex == -1 && downIndex == -1) {
            self.value++;
            self.upVoters.push(userName);
        } else if (upIndex == -1 && downIndex > -1) {
        	self.value++;
        	self.downVoters.splice(downIndex, 1);
        }
        return self.value;
    };
    
    this._down = function (userName) {
    	var upIndex = self.upVoters.indexOf(userName);
    	var downIndex = self.downVoters.indexOf(userName);
    	
        if (downIndex == -1 && upIndex == -1) {
            self.value--;
            self.downVoters.push(userName);
        } else if (downIndex == -1 && upIndex > -1) {
        	self.value--;
        	self.upVoters.splice(upIndex, 1);
        }
        return self.value;
    };
};