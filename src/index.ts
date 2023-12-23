import Telegram from "./telegram";
import startWebController from "./controller";

import statisticsJob from "./job/statisticsJob";

async function main() {
  const telegram = new Telegram();

  console.log("starting ...");

  await telegram.setup();

  console.log("starting web");
  startWebController(telegram);

  //job 启动
  console.log("starting job");
  // patreonJob(telegram);

  statisticsJob(telegram);

  console.log("started");
}

main();
