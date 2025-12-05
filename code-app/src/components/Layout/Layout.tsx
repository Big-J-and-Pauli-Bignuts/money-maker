import { FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import {
  SignOut24Regular,
} from '@fluentui/react-icons';
import MegaMenu from '../MegaMenu/MegaMenu';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  header: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: '56px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('0', '24px'),
    zIndex: 1000,
    '@media (max-width: 768px)': {
      ...shorthands.padding('0', '16px'),
      height: '48px',
    },
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('24px'),
    flex: 1,
  },
  logo: {
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  main: {
    marginTop: '56px',
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding('24px'),
    '@media (max-width: 768px)': {
      marginTop: '48px',
      ...shorthands.padding('16px'),
    },
    '@media (max-width: 480px)': {
      ...shorthands.padding('12px'),
    },
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
});

const Layout: FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  const user = accounts[0];
  const userName = user?.name || 'User';
  const userEmail = user?.username || '';

  console.log('✅ Layout component loaded (fixed header version)');

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div className={styles.root}>
      {/* Fixed Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Text className={styles.logo} onClick={() => navigate('/')}>
            CODE App
          </Text>
          
          {/* MegaMenu Navigation */}
          <MegaMenu />
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.userSection}>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  appearance="subtle"
                  icon={<Avatar name={userName} size={32} />}
                >
                  <span style={{ display: 'none' }}>
                    {userName}
                  </span>
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem disabled>
                    <div>
                      <div>{userName}</div>
                      <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                        {userEmail}
                      </div>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                  <MenuItem onClick={handleLogout} icon={<SignOut24Regular />}>
                    Sign Out
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
