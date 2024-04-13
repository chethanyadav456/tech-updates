import Woker from "./worker";
import { logger } from "./logger";

const woker = new Woker();

// woker.fetchData().then(() => logger.info("Data fetched and sent successfully"));

setInterval(() => {
    woker.fetchData().then(() => logger.info("Data fetched and sent successfully"));
}, 10 * 60 * 1000);