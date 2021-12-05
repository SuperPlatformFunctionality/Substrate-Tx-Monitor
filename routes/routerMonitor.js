import express from 'express'
import PolkadotMonitorController from "../controller/PolkadotMonitorController";

const router = express.Router();
router.post('/polkadot/switch', PolkadotMonitorController.switch);
router.post('/polkadot/trigglerabbitmq', PolkadotMonitorController.trigglerabbitmq);


export default router
