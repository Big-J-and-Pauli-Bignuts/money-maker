import { FC, useState } from 'react';
import {
  Title3,
  Text,
  Button,
  Input,
  Label,
  Switch,
  Dropdown,
  Option,
  makeStyles,
  tokens,
  Card,
} from '@fluentui/react-components';
import { Save24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '800px',
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
  card: {
    padding: tokens.spacingVerticalXL,
    marginBottom: tokens.spacingVerticalL,
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
  },
  preview: {
    padding: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    marginTop: tokens.spacingVerticalM,
  },
});

const UIConfig: FC = () => {
  const styles = useStyles();
  const [config, setConfig] = useState({
    appName: 'CODE App - Admin Automation',
    theme: 'light',
    primaryColor: '#0078D4',
    showLogo: true,
    compactMode: false,
    showBreadcrumbs: true,
    animationsEnabled: true,
  });

  const handleSave = () => {
    // TODO: Save to SharePoint list or Dataverse
    console.log('Saving UI config:', config);
    alert('UI configuration saved successfully!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>UI Configuration</Title3>
        <Text>Customize the application appearance and behavior</Text>
      </div>

      <Card className={styles.card}>
        <Title3>General Settings</Title3>
        
        <div className={styles.formRow}>
          <Label htmlFor="appName">Application Name</Label>
          <Input
            id="appName"
            value={config.appName}
            onChange={(_, data) => setConfig({ ...config, appName: data.value })}
          />
        </div>

        <div className={styles.formRow}>
          <Label htmlFor="theme">Theme</Label>
          <Dropdown
            id="theme"
            value={config.theme}
            onOptionSelect={(_, data) => setConfig({ ...config, theme: data.optionValue as string })}
          >
            <Option value="light">Light</Option>
            <Option value="dark">Dark</Option>
            <Option value="high-contrast">High Contrast</Option>
          </Dropdown>
        </div>

        <div className={styles.formRow}>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input
            id="primaryColor"
            value={config.primaryColor}
            onChange={(_, data) => setConfig({ ...config, primaryColor: data.value })}
            placeholder="#0078D4"
          />
          <div className={styles.preview} style={{ backgroundColor: config.primaryColor }}>
            <Text style={{ color: '#fff' }}>Preview: {config.primaryColor}</Text>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <Title3>Display Options</Title3>
        
        <div className={styles.formRow}>
          <Switch
            checked={config.showLogo}
            onChange={(_,  data) => setConfig({ ...config, showLogo: data.checked })}
            label="Show Logo in Header"
          />
        </div>

        <div className={styles.formRow}>
          <Switch
            checked={config.compactMode}
            onChange={(_,  data) => setConfig({ ...config, compactMode: data.checked })}
            label="Compact Mode"
          />
        </div>

        <div className={styles.formRow}>
          <Switch
            checked={config.showBreadcrumbs}
            onChange={(_,  data) => setConfig({ ...config, showBreadcrumbs: data.checked })}
            label="Show Breadcrumbs"
          />
        </div>

        <div className={styles.formRow}>
          <Switch
            checked={config.animationsEnabled}
            onChange={(_,  data) => setConfig({ ...config, animationsEnabled: data.checked })}
            label="Enable Animations"
          />
        </div>
      </Card>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          icon={<Save24Regular />}
          onClick={handleSave}
        >
          Save Configuration
        </Button>
        <Button>Reset to Defaults</Button>
      </div>
    </div>
  );
};

export default UIConfig;
