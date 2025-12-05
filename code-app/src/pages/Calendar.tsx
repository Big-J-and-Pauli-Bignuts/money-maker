import { FC } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Button,
  Card,
} from '@fluentui/react-components';
import { Add24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...shorthands.gap('12px'),
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      '& button': {
        width: '100%',
      },
    },
  },
  calendarContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('24px'),
    minHeight: '500px',
  },
});

const Calendar: FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title3>Calendar</Title3>
        <Button appearance="primary" icon={<Add24Regular />}>
          New Meeting
        </Button>
      </div>

      <Card className={styles.calendarContainer}>
        {/* Calendar component will go here */}
        <p>Calendar view with Outlook integration coming soon...</p>
      </Card>
    </div>
  );
};

export default Calendar;
