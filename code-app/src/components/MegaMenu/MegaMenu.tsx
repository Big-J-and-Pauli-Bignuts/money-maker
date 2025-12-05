import { FC, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Spinner,
} from '@fluentui/react-components';
import {
  Navigation24Regular,
  ChevronDown24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons';
import { sharepointClient } from '../../services/sharepoint';

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  parentId?: string;
  order: number;
  isExternal?: boolean;
  openInNewTab?: boolean;
}

const useStyles = makeStyles({
  menuBar: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    ...shorthands.padding('0', '16px'),
    height: '100%',
    '@media (max-width: 1024px)': {
      display: 'none',
    },
  },
  mobileMenuButton: {
    display: 'none',
    '@media (max-width: 1024px)': {
      display: 'flex',
    },
  },
  menuItem: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  menuButton: {
    height: '100%',
    ...shorthands.borderRadius('0'),
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  menuButtonActive: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
    ...shorthands.borderBottom('2px', 'solid', tokens.colorBrandBackground),
  },
  megaMenuPanel: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    boxShadow: tokens.shadow16,
    zIndex: 1000,
    maxHeight: '500px',
    overflowY: 'auto',
  },
  megaMenuContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    ...shorthands.padding('32px', '24px'),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    ...shorthands.gap('32px'),
  },
  menuColumn: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
  },
  columnTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: '8px',
  },
  menuLink: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  linkTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
  },
  linkDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  mobileMenu: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: tokens.colorNeutralBackground1,
    zIndex: 2000,
    overflowY: 'auto',
    ...shorthands.padding('16px'),
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  mobileMenuItem: {
    ...shorthands.padding('16px'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
  },
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.padding('32px'),
  },
});

interface MegaMenuProps {
  sitePath?: string;
  listName?: string;
}

const MegaMenu: FC<MegaMenuProps> = ({ 
  sitePath = '/sites/aivana', 
  listName = 'Navigation Menu' 
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMenuItems();
    
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await sharepointClient.getListItems(sitePath, listName);
      
      const menuData: MenuItem[] = items.map((item: any) => ({
        id: item.id,
        title: item.fields.Title || '',
        url: item.fields.URL || '',
        description: item.fields.Description || '',
        parentId: item.fields.ParentId || null,
        order: item.fields.Order || 0,
        isExternal: item.fields.IsExternal || false,
        openInNewTab: item.fields.OpenInNewTab || false,
      }));

      // Sort by order
      menuData.sort((a, b) => a.order - b.order);
      setMenuItems(menuData);
      console.log('✅ Menu loaded from SharePoint:', menuData.length, 'items');
    } catch (err) {
      console.warn('⚠️ SharePoint menu list not found, using default menu');
      console.log('ℹ️ To use SharePoint menu, create a list named "Navigation Menu" at', sitePath);
      // Fallback to default menu if SharePoint fails
      setMenuItems(getDefaultMenuItems());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMenuItems = (): MenuItem[] => [
    { id: '1', title: 'Dashboard', url: '/', order: 1 },
    { id: '2', title: 'Calendar', url: '/calendar', order: 2 },
    { id: '3', title: 'Tasks', url: '/tasks', order: 3 },
    { id: '4', title: 'Documents', url: '/documents', order: 4 },
    { id: '5', title: 'Settings', url: '/settings', order: 5 },
  ];

  const getTopLevelItems = () => menuItems.filter(item => !item.parentId);
  const getChildItems = (parentId: string) => menuItems.filter(item => item.parentId === parentId);

  const handleMenuClick = (item: MenuItem) => {
    if (item.url) {
      if (item.isExternal || item.openInNewTab) {
        window.open(item.url, '_blank');
      } else {
        navigate(item.url);
      }
    }
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  const renderDesktopMenu = () => {
    const topLevelItems = getTopLevelItems();

    return (
      <div className={styles.menuBar} ref={menuRef}>
        {topLevelItems.map((item) => {
          const children = getChildItems(item.id);
          const hasChildren = children.length > 0;
          const isActive = activeMenu === item.id;

          return (
            <div key={item.id} className={styles.menuItem}>
              <Button
                appearance="subtle"
                className={`${styles.menuButton} ${isActive ? styles.menuButtonActive : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    setActiveMenu(isActive ? null : item.id);
                  } else {
                    handleMenuClick(item);
                  }
                }}
                icon={hasChildren ? <ChevronDown24Regular /> : undefined}
                iconPosition="after"
              >
                {item.title}
              </Button>

              {hasChildren && isActive && (
                <div className={styles.megaMenuPanel}>
                  <div className={styles.megaMenuContent}>
                    {children.map((child) => (
                      <div key={child.id} className={styles.menuColumn}>
                        <div
                          className={styles.menuLink}
                          onClick={() => handleMenuClick(child)}
                        >
                          <Text className={styles.linkTitle}>{child.title}</Text>
                          {child.description && (
                            <Text className={styles.linkDescription}>
                              {child.description}
                            </Text>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMobileMenu = () => {
    const topLevelItems = getTopLevelItems();

    return (
      <>
        <Button
          appearance="subtle"
          icon={<Navigation24Regular />}
          onClick={() => setMobileMenuOpen(true)}
          className={styles.mobileMenuButton}
        >
          Menu
        </Button>

        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuHeader}>
              <Text weight="semibold" size={500}>Navigation</Text>
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>

            {topLevelItems.map((item) => {
              const children = getChildItems(item.id);
              
              return (
                <div key={item.id}>
                  <div
                    className={styles.mobileMenuItem}
                    onClick={() => {
                      if (children.length === 0) {
                        handleMenuClick(item);
                      }
                    }}
                  >
                    <Text weight="semibold">{item.title}</Text>
                  </div>
                  
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className={styles.mobileMenuItem}
                      onClick={() => handleMenuClick(child)}
                      style={{ paddingLeft: '32px' }}
                    >
                      <Text>{child.title}</Text>
                      {child.description && (
                        <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
                          {child.description}
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="small" />
      </div>
    );
  }

  return (
    <>
      {renderDesktopMenu()}
      {renderMobileMenu()}
    </>
  );
};

export default MegaMenu;
