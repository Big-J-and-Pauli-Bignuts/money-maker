import { FC } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Card,
  CardHeader,
  Text,
  Switch,
  Button,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
  },
  settingsGrid: {
    display: 'grid',
    ...shorthands.gap('24px'),
    maxWidth: '800px',
    '@media (max-width: 768px)': {
      maxWidth: '100%',
    },
  },
  card: {
    width: '100%',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('16px'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    '&:last-child': {
      ...shorthands.borderBottom('none'),
    },
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      ...shorthands.gap('12px'),
    },
  },
  settingLabel: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
});

const Settings: FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Title3>Settings</Title3>

      <div className={styles.settingsGrid}>
        {/* Notifications Settings */}
        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Notifications</Text>} />
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">Email Notifications</Text>
              <Text size={200}>Receive notifications via email</Text>
            </div>
            <Switch />
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">Teams Notifications</Text>
              <Text size={200}>Receive notifications in Microsoft Teams</Text>
            </div>
            <Switch defaultChecked />
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">Meeting Reminders</Text>
              <Text size={200}>Get reminders before meetings</Text>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Appearance</Text>} />
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">Theme</Text>
              <Text size={200}>Light mode is currently enabled</Text>
            </div>
            <Button>Change Theme</Button>
          </div>
        </Card>

        {/* Integration Settings */}
        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold">Integrations</Text>} />
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">Microsoft 365</Text>
              <Text size={200}>Connected</Text>
            </div>
            <Button appearance="subtle">Manage</Button>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <Text weight="semibold">SharePoint</Text>
              <Text size={200}>Connected</Text>
            </div>
            <Button appearance="subtle">Manage</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
