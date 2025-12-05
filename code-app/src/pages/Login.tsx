import { FC, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/auth';
import {
  makeStyles,
  shorthands,
  tokens,
  Title1,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding('16px'),
  },
  card: {
    maxWidth: '400px',
    width: '100%',
    ...shorthands.padding('32px'),
    textAlign: 'center',
  },
  title: {
    marginBottom: '16px',
  },
  description: {
    marginBottom: '32px',
    color: tokens.colorNeutralForeground2,
  },
  button: {
    width: '100%',
  },
});

const Login: FC = () => {
  const styles = useStyles();
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated via SSO, redirect to home
    if (accounts.length > 0) {
      navigate('/');
    }
  }, [accounts, navigate]);

  const handleLogin = async () => {
    try {
      // Use redirect for SSO instead of popup
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <Title1 className={styles.title}>CODE App</Title1>
        <Body1 className={styles.description}>
          Administrative Automation Platform
          <br />
          Please sign in to continue
        </Body1>
        <Button
          appearance="primary"
          size="large"
          onClick={handleLogin}
          className={styles.button}
        >
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
};

export default Login;
