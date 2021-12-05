'use strict';
class StatisticMiddleWare {
	constructor() {
//		super()
		this.apiRecord = this.apiRecord.bind(this)
	}
	async apiRecord(req, res, next) {

		next()
	}
}

export default new StatisticMiddleWare()
