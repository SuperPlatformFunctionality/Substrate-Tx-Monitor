'use strict';
import rabbitmqPublisher from "../rabbitmq/rabbitmq_publisher";
import myUtils from "../utils/MyUtils.js";
import config from '../config/index.js';
const polkadotNodeUrl = config.polkadotNodeUrl;

import { ApiPromise, WsProvider } from '@polkadot/api';

import { fetchRemarks, getRemarksFromBlocks, getLatestFinalizedBlock, Consolidator } from 'rmrk-tools';
import path from "path";
import fs from "fs";

const BLOCK_TRAVEL_LEGHTH = 5;
class PolkadotMonitorService {

	constructor() {
//		super();
		this.running = false;
		this.onReceiveRegisterTxMsg = this.onReceiveRegisterTxMsg.bind(this);
		this.monitorLoop = this.monitorLoop.bind(this);
		this.startMonitor = this.startMonitor.bind(this);
		this.stopMonitor = this.stopMonitor.bind(this);
		this.testRabbitMQ = this.testRabbitMQ.bind(this);
	}

	async onReceiveRegisterTxMsg(msgObj) {
		return true;
	}

	async monitorLoop() {
		let that = this;
		const wsProvider = new WsProvider(polkadotNodeUrl);
		let api = await ApiPromise.create({ provider: wsProvider });

		const systemProperties = await api.rpc.system.properties();
		const ss58Format = systemProperties.toHuman().ss58Format;
		const consolidator = new Consolidator(ss58Format);

		let curBlkNoStart = recentRecordblkNumber;
		let curBlkNoEnd = curBlkNoStart + BLOCK_TRAVEL_LEGHTH;
		while(that.running) {
			recentRecordblkNumber = curBlkNoStart;
			try {
				let latestBlkNo = await getLatestFinalizedBlock(api);
				if(curBlkNoEnd >= latestBlkNo) {
					const sleepSecs = 3;
					console.log(`----sleep ${sleepSecs} seconds and waiting for polkadot produces more blocks---`);
					await myUtils.sleepForMillisecond(sleepSecs * 1000);
					continue;
				}
				console.log(`[${curBlkNoStart}-${curBlkNoEnd}]----start----${new Date()}`);
				const remarkBlocks = await fetchRemarks(api, curBlkNoStart, curBlkNoEnd, [ '0x726d726b', '0x524d524b' ]);

				//need to filter the RMRK version ?

				if (remarkBlocks && remarkBlocks.length > 0) {
					const remarks = getRemarksFromBlocks(remarkBlocks, [ '0x726d726b', '0x524d524b' ]);
//					console.log("remarks:", remarks);
					for(let j = 0 ; j < remarks.length ; j++) {
						let tempRemark = remarks[j];
						console.log(tempRemark);
						await rabbitmqPublisher.send(tempRemark);
					}

					//do consolidation ...to change the current status, do delta change......
//					const { nfts, collections } = await consolidator.consolidate(remarks);
//					console.log('Consolidated nfts:', nfts);
//					console.log('Consolidated collections:', collections);
				} else {
					console.log("no remarks block");
				}
				curBlkNoStart = curBlkNoEnd + 1;
				curBlkNoEnd = curBlkNoEnd + BLOCK_TRAVEL_LEGHTH;
				console.log("\n");
			} catch(e) {
				console.error("[in monitorLoop] exception:", e);
				await myUtils.sleepForMillisecond(1500);
			}
		}
	}

	async startMonitor() {
		let that = this;
		if(that.running) {
			return;
		}
		console.log("monitor start");
		that.running = true;
		await that.monitorLoop();
		that.running = false;
		console.log("monitor stop");
	}

	async stopMonitor() {
		this.running = false;
	}

	async testRabbitMQ() {

	}

}

let polkadotMonitorService = new PolkadotMonitorService();
//RabbitMqConsumer.addListener(polkadotMonitorService.onReceiveRegisterTxMsg);
export default polkadotMonitorService;


let projectRootPath = require.main.path;
let recentRecordBlkNoBackupFile = path.join(projectRootPath, "recent_record_block_number_backup_file.txt");
let readRecentRecordBlkNoFromBackupFile = function() {
	let contStr = fs.existsSync(recentRecordBlkNoBackupFile) ? fs.readFileSync(recentRecordBlkNoBackupFile).toString() : "0";
	let ret = parseInt(contStr);
	return ret;
}
let writeRecentRecordBlkNoToBackupFile = function(blkNo) {
	let conStr = blkNo + "";
	fs.writeFile(recentRecordBlkNoBackupFile, conStr, function(err) {
		if(err) {
			console.error("writeRecentRecordBlkNoToBackupFile write error:", err);
		}
	});
}
let recentRecordblkNumber = readRecentRecordBlkNoFromBackupFile();

//3分钟保存一次当前块状态，当前是使用txt文件保存，需要一个稳定性更高的方案
const RECENT_RECORD_BLOCKNO_PERSIS_INTERVAL = 3; //minute
setInterval(function() {
	writeRecentRecordBlkNoToBackupFile(recentRecordblkNumber);
}, RECENT_RECORD_BLOCKNO_PERSIS_INTERVAL * 60 * 1000);


