'use strict';

class CheckMiddleWare {
	constructor() {

	}

	async checkUserSession(req, res, next) {
		next();
	}
}

export default new CheckMiddleWare()
