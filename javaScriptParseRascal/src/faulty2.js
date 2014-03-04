		if (!CoolClock.config.isIE) {
			this.ctx.beginPath();
		}

		if (CoolClock.config.isIE) {
			
			this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
		}