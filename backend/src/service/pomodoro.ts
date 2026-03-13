import { Database } from "sqlite";
import { WebSocket } from "ws";

const timer = 25 * 60 * 1000;

// temp timers
const study_time = 5 * 1000;
const break_time = 1 * 1000;
const long_break = 3 * 1000;

enum POMO_STATE {
  study, break
}

export class Pomodoro {
  private pomoDone = 0;
  private state: POMO_STATE;

  // add ws
  constructor(user_id: string) {
    this.state = POMO_STATE.study;
  }

  public start() {
    this.switchState();
  }

  private switchState() {
    switch (this.state) {
      case POMO_STATE.study:
        console.log('Study: ' + new Date().getSeconds());
        setTimeout(() => {
          this.pomoDone++;
          this.state = POMO_STATE.break;
          this.switchState();
        }, study_time);
      
        break;

      case POMO_STATE.break:
        console.log('Break: ' + new Date().getSeconds());
        console.log('\t pomo done: ' + this.pomoDone)
        const time = (this.pomoDone % 4 == 0) ? long_break : break_time;

        setTimeout(() => {
          this.state = POMO_STATE.study;
          this.switchState();
        }, time)

        break;
      default:
        break;
    }
  }
}

const pomo = new Pomodoro('');
pomo.start();