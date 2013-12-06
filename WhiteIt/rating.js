module.exports = function Rating() {
    this.value = 0;
    var upVoters = [];
    var downVoters = [];
    var self = this;
    
    this._up = function(userId) {
        if (!upVoters[userId] && !downVoters[userId]) {
            self.value++;
            upVoters[userId] = true;
        } else if (!upVoters[userId] && downVoters[userId]) {
        	self.value++;
        	downVoters[userId] = false;
        }
        return self.value;
    };
    
    this._down = function (userId) {
        if (!downVoters[userId] && !upVoters[userId]) {
            self.value--;
            downVoters[userId] = true;
        } else if (!downVoters[userId] && upVoters[userId]) {
        	self.value--;
        	upVoters[userId] = false;
        }
        return self.value;
    };
};