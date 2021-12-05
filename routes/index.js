import routerMonitor from "./routerMonitor.js";

export default app => {
	app.use("/monitor", routerMonitor);
}
