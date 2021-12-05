'use strict';
import BaseComponent from '../prototype/BaseComponent.js'
import ResponseCode from "../utils/ResponseCode.js";
import ResponseModel from "../utils/ResponseModel.js";
import ResponseCodeError from "../utils/ResponseCodeError.js";
import polkadotMonitorService from "../service/PolkadotMonitorService.js";

class PolkadotMonitorController extends BaseComponent {

	constructor() {
		super();
		this.switch = this.switch.bind(this);
		this.trigglerabbitmq = this.trigglerabbitmq.bind(this);
	}

	async switch(req, res, next) {
		let resJson = new ResponseModel(ResponseCode.SUCCESS, "ok");
		let cmd = req.body["cmd"];
		do {
			try {
				if(cmd == "start") {
					await polkadotMonitorService.startMonitor();
				} else if(cmd == "stop") {
					await polkadotMonitorService.stopMonitor();
				} else {
					resJson = new ResponseModel(ResponseCode.PARAM_ERROR);
				}
			} catch(e) {
				resJson = new ResponseModel((e instanceof ResponseCodeError)?e.respondCode:ResponseCode.SYSTEM_ERROR);
			}
		} while(0);
		res.send(resJson);
	}

	async trigglerabbitmq(req, res, next) {
		let resJson = new ResponseModel(ResponseCode.SUCCESS, "ok");
		do {
			try {
				let tmpObj = req.body;
				console.log("monitor receive triggle rabbitmq");
				await polkadotMonitorService.testRabbitMQ();
			} catch(e) {
				resJson = new ResponseModel((e instanceof ResponseCodeError)?e.respondCode:ResponseCode.SYSTEM_ERROR);
			}
		} while(0);
		res.send(resJson);
	}

}

export default new PolkadotMonitorController();
