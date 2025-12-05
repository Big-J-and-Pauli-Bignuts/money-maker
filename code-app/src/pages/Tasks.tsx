import { FC } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Button,
  Card,
  Tab,
  TabList,
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
  tasksContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('24px'),
  },
  tabs: {
    marginBottom: '24px',
  },
});

const Tasks: FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title3>Tasks</Title3>
        <Button appearance="primary" icon={<Add24Regular />}>
          New Task
        </Button>
      </div>

      <Card className={styles.tasksContainer}>
        <TabList className={styles.tabs} defaultSelectedValue="all">
          <Tab value="all">All Tasks</Tab>
          <Tab value="active">Active</Tab>
          <Tab value="completed">Completed</Tab>
        </TabList>
        
        {/* Task list will go here */}
        <p>No tasks yet. Create one to get started!</p>
      </Card>
    </div>
  );
};

export default Tasks;
