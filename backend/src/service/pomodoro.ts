import { nanoid } from 'nanoid';
import { Server } from 'socket.io';
import { Database } from 'sqlite';
import { ServerError } from '../errors';

const study_time = 25 * 60 * 1000;
const break_time = 1 * 60 * 1000;
const long_break = 3 * 60 * 1000;
// const study_time = 25 * 1000;
// const break_time = 1 * 1000;
// const long_break = 3 * 1000;
const pomo_to_long = 4;
const idle_limit_no_user = 30;
const affectionPerPomo = 100;

enum POMO_STATE {
  study = 'Studying', break = 'On Break'
}

export class Pomodoro {
  private pomoDone = 0;
  private state: POMO_STATE = POMO_STATE.study;
  private start: Date = new Date();
  private timerId!: NodeJS.Timeout;
  private tickInterval!: NodeJS.Timeout;
  private endOfNextTimer!: Date;
  private emptyRoomForSec = 0;

  private readonly roomId: string;
  private readonly sessionId: string = nanoid();

  constructor(
    private db: Database,
    private readonly io: Server,
    private readonly userId: string,
    private readonly onDelete: () => void
  ) {
    this.roomId = `pomodoro:${userId}`;
  }

  async deletePomo() {
    clearTimeout(this.timerId);
    clearInterval(this.tickInterval);

    await this.updatePomoDb();
    await this.db.run(`UPDATE pomodoro_session SET is_active = 0 WHERE id = ? 
      `, [this.sessionId]);
  }

  // POMODORO SETUP -----------

  static async create(db: Database, io: Server, userId: string, onDelete: () => void) {
    const instance = new Pomodoro(db, io, userId, onDelete);
    await instance.init();
    return instance;
  }

  private async init() {
    await this.checkActivePomodoro();

    await this.db.run(
      'INSERT INTO pomodoro_session (id, user_id, start_time) VALUES (?, ?, datetime(\'now\'))',
      [this.sessionId, this.userId]
    );
    this.startTimer();
  }

  private async checkActivePomodoro() {
    const pomo = await this.db.get(
      'SELECT id FROM pomodoro_session WHERE user_id = ? AND is_active = 1',
      [this.userId]);

    if (pomo) throw new ServerError('POMO', 'Active Pomodoro session already exists for this user');
  }

  // PRIVATE -----------

  private startTimer() {
    this.switchState();

    this.tickInterval = setInterval(async () => {
      const sockets = await this.io.in(this.roomId).fetchSockets();

      if (sockets.length === 0) {
        this.emptyRoomForSec++;
        if (this.emptyRoomForSec >= idle_limit_no_user) {
          await this.deletePomo();
          this.onDelete();
        }
      } else {
        this.emptyRoomForSec = 0;
        this.emitUpdate();
      }
    }, 1000);
  }

  private async switchState() {
    if (this.state === POMO_STATE.study) {
      this.endOfNextTimer = new Date(Date.now() + study_time);
      this.emitUpdate();

      this.timerId = setTimeout(async () => {
        this.pomoDone++;
        await this.updatePomoDb();
        await this.updateAffectionDb();

        this.state = POMO_STATE.break;
        this.switchState();
      }, study_time);
    } else {
      const time = (this.pomoDone % pomo_to_long === 0) ? long_break : break_time;

      this.endOfNextTimer = new Date(Date.now() + time);
      this.emitUpdate();

      this.timerId = setTimeout(() => {
        this.state = POMO_STATE.study;
        this.switchState();
      }, time);
    }
  }

  private emitUpdate() {
    this.io.to(this.roomId).emit('pomodoro:tick', {
      state: this.state,
      timeRemaining: this.endOfNextTimer.getTime() - Date.now(),
      elapsedTime: Date.now() - this.start.getTime()
    });
  }

  private async updatePomoDb() {
    await this.db.run(`
      UPDATE pomodoro_session SET end_time = datetime('now'), pomodoro_complete = (?) WHERE id = ?
    `, [this.pomoDone, this.sessionId]);
  }

  private async updateAffectionDb() {
    await this.db.run(`
      UPDATE relationship SET points = points + ?
      WHERE char_id = (SELECT romance_character_id FROM users WHERE id = ?)
      AND user_id = ?
    `, [affectionPerPomo, this.userId, this.userId]);
  }
}

// export class Pomodoro {
//   private pomoDone = 0;
//   private state: POMO_STATE;

//   // add ws
//   constructor(user_id: string) {
//     this.state = POMO_STATE.study;
//   }

//   public start() {
//     this.switchState();
//   }

//   private switchState() {
//     switch (this.state) {
//       case POMO_STATE.study:
//         console.log('Study: ' + new Date().getSeconds());
//         setTimeout(() => {
//           this.pomoDone++;
//           this.state = POMO_STATE.break;
//           this.switchState();
//         }, study_time);

//         break;

//       case POMO_STATE.break:
//         console.log('Break: ' + new Date().getSeconds());
//         console.log('\t pomo done: ' + this.pomoDone)
//         const time = (this.pomoDone % 4 == 0) ? long_break : break_time;

//         setTimeout(() => {
//           this.state = POMO_STATE.study;
//           this.switchState();
//         }, time)

//         break;
//       default:
//         break;
//     }
//   }
// }
