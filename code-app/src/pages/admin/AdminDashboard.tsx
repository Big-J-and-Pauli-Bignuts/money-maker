import { FC } from 'react';
import {
  Card,
  Text,
  Title3,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Settings24Regular,
  Navigation24Regular,
  Database24Regular,
  DocumentTable24Regular,
  Apps24Regular,
  PeopleTeam24Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingVerticalL,
    marginTop: tokens.spacingVerticalXL,
  },
  card: {
    padding: tokens.spacingVerticalXL,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16,
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
  },
  description: {
    color: tokens.colorNeutralForeground2,
  },
});

const AdminDashboard: FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'UI Configuration',
      description: 'Manage themes, layouts, and visual settings',
      icon: <Settings24Regular className={styles.icon} />,
      path: '/admin/ui-config',
    },
    {
      title: 'Navigation Menu',
      description: 'Configure mega menu items and navigation structure',
      icon: <Navigation24Regular className={styles.icon} />,
      path: '/admin/navigation',
    },
    {
      title: 'SharePoint Content',
      description: 'Manage documents, lists, and site content',
      icon: <DocumentTable24Regular className={styles.icon} />,
      path: '/admin/sharepoint',
    },
    {
      title: 'Dataverse Tables',
      description: 'Configure custom tables and data entities',
      icon: <Database24Regular className={styles.icon} />,
      path: '/admin/dataverse',
    },
    {
      title: 'App Settings',
      description: 'Global application settings and features',
      icon: <Apps24Regular className={styles.icon} />,
      path: '/admin/settings',
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <PeopleTeam24Regular className={styles.icon} />,
      path: '/admin/users',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>Administration</Title3>
        <Text>Manage application configuration and content</Text>
      </div>

      <div className={styles.grid}>
        {adminSections.map((section) => (
          <Card
            key={section.path}
            className={styles.card}
            onClick={() => navigate(section.path)}
          >
            <div className={styles.cardContent}>
              {section.icon}
              <Title3>{section.title}</Title3>
              <Text className={styles.description}>{section.description}</Text>
              <Button appearance="primary">Manage</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
