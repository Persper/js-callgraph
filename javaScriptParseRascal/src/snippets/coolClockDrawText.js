function f(theText,x,y) {
		this.ctx.save();
		this.ctx.font = '15px sans-serif';
		var tSize = this.ctx.measureText(theText);
		if (!tSize.height) tSize.height = 15; 
		this.ctx.fillText(theText,x - tSize.width/2,y - tSize.height/2);
		this.ctx.restore();
}