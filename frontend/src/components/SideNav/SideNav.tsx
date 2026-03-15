import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SideNav.module.css';

import mainmenuIcon   from '../../assets/icons/homeMenu.png';
import todoIcon       from '../../assets/icons/toDo.png';
import pomodoroIcon   from '../../assets/icons/pomoTimerLogo.png';
import cutsceneIcon   from '../../assets/icons/dateLogo.png';
import statisticsIcon from '../../assets/icons/statsLogo.png';
import settingsIcon   from '../../assets/icons/settingsLogo.png';

const NAV_ITEMS = [
  { label: 'Main Menu',  path: '/menu',       icon: mainmenuIcon   },
  { label: 'To Do',      path: '/todo',        icon: todoIcon       },
  { label: 'Pomodoro',   path: '/pomodoro',    icon: pomodoroIcon   },
  { label: 'Cutscenes',  path: '/cutscenes',   icon: cutsceneIcon   },
  { label: 'Statistics', path: '/statistics',  icon: statisticsIcon },
  { label: 'Settings',   path: '/settings',    icon: settingsIcon   },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hidden = ['/', '/login', '/register'].includes(location.pathname);
  if (hidden) return null;

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.path}
          className={`${styles.btn} ${location.pathname === item.path ? styles.active : ''}`}
          onClick={() => navigate(item.path)}
        >
          <img src={item.icon} alt={item.label} className={styles.icon} />
          <span className={styles.tooltip}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}