if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(function (require, exports) {
	function Parser () {
		this.clean();
	}

	Parser.prototype.chunkRegex = /@@\s*-(\d+)(,\d+)?\s*\+\d+(,\d+)?\s*@@/;

	Parser.prototype.clean = function () {
		// results
		this.additions = [];
		this.deletions = [];

		// states
		this.inAdd = false;
		this.inDel = false;
		this.inChunk = false;

		// helper vars	
		this.addStart = null;
		this.delStart = null;
		this.addNumLines = null;
		this.cur = null;
	};

	Parser.prototype.startAdd = function () {
		this.inAdd = true;
		this.addStart = this.cur - 1;
		this.addNumLines = 1;
	};

	Parser.prototype.startDel = function () {
		this.inDel = true;
		this.delStart = this.cur;
	};

	Parser.prototype.finishAdd = function () {
		this.inAdd = false;
		this.additions.push([this.addStart, this.addNumLines]);
	};

	Parser.prototype.finishDel = function () {
		this.inDel = false;
		this.deletions.push([this.delStart, this.cur - 1]);
	};

	Parser.prototype.parse = function (patch) {
		this.clean();
		const lines = patch.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!this.inChunk) {
				if (line.startsWith('@@'))
					this.inChunk = true;
				else
					continue;
			}

			if (line.startsWith('@@')) {
				const arr = this.chunkRegex.exec(line);
				this.cur = Math.max(parseInt(arr[1]), 1);
			} 
			else if (line.startsWith('-')) {
				if (this.inAdd) 
					this.finishAdd();
				if (!this.inDel)
					this.startDel();
				// always increment in minus
				this.cur += 1;
			}
			else if (line.startsWith('+')) {
				if (this.inDel)
					this.finishDel();
				if (this.inAdd)
					this.addNumLines += 1;
				else
					this.startAdd();
			}
			else {
				if (this.inAdd)
					this.finishAdd();
				else if (this.inDel)
					this.finishDel();
				// always increment in blank
				this.cur += 1;
			}
		}

		if (this.inAdd)
			this.finishAdd();
		else if (this.inDel)
			this.finishDel();

		return { 'adds': this.additions, 'dels': this.deletions}
	};

	Parser.prototype.invParse = function (patch) {
		const addDels = this.parse(patch);
		const adds = addDels['adds'], dels = addDels['dels'];
		return this.inverse(adds, dels);
	};

	Parser.prototype.inverse = function (adds, dels) {
		// offset between new and old files' line numbers
		let offset = 0;
		// add pointer and del pointer
		let ap = 0, dp = 0;
		const aLen = adds.length, dLen = dels.length;
		const invAdds = [], invDels = [];

		function handleAdd (a) {
			invDels.push([offset + a[0] + 1, offset + a[0] + a[1]]);
			offset += a[1];
		} 

		function handleDel (d) {
			invAdds.push([offset + d[0] - 1, d[1] - d[0] + 1]);
			offset -= (d[1] - d[0] + 1);
		}

		while (ap < aLen || dp < dLen) {
			if (ap < aLen && dp < dLen) {
				if (adds[ap][0] < dels[dp][0]) {
					handleAdd(adds[ap]);
					ap += 1;
				}
				else {
					handleDel(dels[dp]);
					dp += 1;
				}
			}
			else if (ap < aLen && dp >= dLen) {
				// we have finished dels
				handleAdd(adds[ap]);
				ap += 1;
			}
			else {
				handleDel(dels[dp]);
				dp += 1;
			}
		}

		return { 'adds': invAdds, 'dels': invDels }
	};


	exports.Parser = Parser;
	return exports;
});
