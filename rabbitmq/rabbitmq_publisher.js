let config =  require("../config");
const mqConfig = config.rabbitMq;
const Broker = require('rascal').BrokerAsPromised;
import polkadotMonitorService from "../service/PolkadotMonitorService"

let broker = null;
async function initPublisher() {
	try {
		broker = await Broker.create(mqConfig);
		broker.on('error', console.error);

		console.log("rabbitmq linked...");
		//确实这里就是成功连接了rabbit了吗?不应该在success回调里再开启吗?
		await polkadotMonitorService.startMonitor();
	} catch (err) {
		console.error(err);
	}
}

let send = async function(msg) {
	const publication = await broker.publish('tx_monitor_pub', msg);
	publication.on('error', console.error);
}

initPublisher();

exports.send = send;
