import { FC, useEffect, useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title2,
  Card,
  CardHeader,
  Text,
  Button,
  Spinner,
  Caption1,
} from '@fluentui/react-components';
import {
  Calendar24Regular,
  TaskListSquareLtr24Regular,
  Document24Regular,
  Add24Regular,
  Open16Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { sharepointClient, SharePointFile } from '../services/sharepoint';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
  },
  welcome: {
    marginBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    ...shorthands.gap('24px'),
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('16px'),
    },
  },
  card: {
    height: '100%',
  },
  cardContent: {
    ...shorthands.padding('16px'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  quickActions: {
    display: 'flex',
    ...shorthands.gap('12px'),
    flexWrap: 'wrap',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('8px', '0'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    '&:last-child': {
      ...shorthands.borderBottom('none'),
    },
  },
  documentName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const Dashboard: FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<SharePointFile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    loadRecentDocuments();
  }, []);

  const loadRecentDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await sharepointClient.getRecentFiles('/sites/aivana', 5);
      setRecentDocs(docs);
    } catch (err) {
      console.error('Error loading recent documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.root}>
      <div>
        <Title2 className={styles.welcome}>Welcome back!</Title2>
        <Text>Here's what's happening today</Text>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Button appearance="primary" icon={<Add24Regular />}>
          Create Meeting
        </Button>
        <Button icon={<Add24Regular />}>New Task</Button>
        <Button icon={<Add24Regular />}>Upload Document</Button>
      </div>

      {/* Widget Grid */}
      <div className={styles.grid}>
        {/* Calendar Widget */}
        <Card className={styles.card}>
          <CardHeader
            image={<Calendar24Regular />}
            header={<Text weight="semibold">Today's Schedule</Text>}
          />
          <div className={styles.cardContent}>
            <Text>No meetings scheduled for today</Text>
            <Button appearance="transparent">View Calendar</Button>
          </div>
        </Card>

        {/* Tasks Widget */}
        <Card className={styles.card}>
          <CardHeader
            image={<TaskListSquareLtr24Regular />}
            header={<Text weight="semibold">Active Tasks</Text>}
          />
          <div className={styles.cardContent}>
            <Text>0 tasks pending</Text>
            <Button appearance="transparent">View All Tasks</Button>
          </div>
        </Card>

        {/* Documents Widget */}
        <Card className={styles.card}>
          <CardHeader
            image={<Document24Regular />}
            header={<Text weight="semibold">Recent Documents (Aivana)</Text>}
          />
          <div className={styles.cardContent}>
            {loadingDocs ? (
              <Spinner size="small" label="Loading..." />
            ) : recentDocs.length > 0 ? (
              <>
                {recentDocs.map((doc) => (
                  <div key={doc.id} className={styles.documentItem}>
                    <div className={styles.documentName}>
                      <Text size={300}>{doc.name}</Text>
                      <br />
                      <Caption1>{formatDate(doc.lastModifiedDateTime)}</Caption1>
                    </div>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Open16Regular />}
                      onClick={() => window.open(doc.webUrl, '_blank')}
                    />
                  </div>
                ))}
                <Button 
                  appearance="transparent" 
                  onClick={() => navigate('/documents')}
                  style={{ marginTop: '12px' }}
                >
                  Browse All Documents
                </Button>
              </>
            ) : (
              <>
                <Text>No recent documents</Text>
                <Button 
                  appearance="transparent"
                  onClick={() => navigate('/documents')}
                >
                  Browse Documents
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
