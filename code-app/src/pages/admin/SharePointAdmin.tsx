import { FC, useState, useEffect } from 'react';
import {
  Title3,
  Text,
  Button,
  makeStyles,
  tokens,
  Card,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  Spinner,
  Tab,
  TabList,
} from '@fluentui/react-components';
import { Folder24Regular, Document24Regular, Add24Regular, Delete24Regular, ArrowUpload24Regular } from '@fluentui/react-icons';
import { sharepointClient as sharePointClient } from '../../services/sharepoint';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabs: {
    marginBottom: tokens.spacingVerticalL,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  grid: {
    marginTop: tokens.spacingVerticalL,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
  },
});

interface SharePointItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  modified: string;
  modifiedBy: string;
  size?: number;
}

const SharePointAdmin: FC = () => {
  const styles = useStyles();
  const [items, setItems] = useState<SharePointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('documents');

  useEffect(() => {
    loadItems();
  }, [selectedTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      if (selectedTab === 'documents') {
        const docs = await sharePointClient.getDocuments('/sites/aivana');
        setItems(docs.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.file ? 'file' : 'folder',
          modified: doc.lastModifiedDateTime,
          modifiedBy: doc.lastModifiedBy?.user?.displayName || 'Unknown',
          size: doc.size,
        })));
      } else if (selectedTab === 'lists') {
        // Load lists from SharePoint
        const lists = await sharePointClient.getListItems('Lists', '/sites/aivana');
        setItems(lists.map((list: any) => ({
          id: list.Id,
          name: list.Title,
          type: 'folder',
          modified: list.Modified,
          modifiedBy: list.Author?.Title || 'Unknown',
        })));
      }
    } catch (error) {
      console.error('Failed to load SharePoint items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // TODO: Implement delete
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    alert('File upload functionality coming soon!');
  };

  const columns: TableColumnDefinition<SharePointItem>[] = [
    createTableColumn<SharePointItem>({
      columnId: 'name',
      renderHeaderCell: () => 'Name',
      renderCell: (item) => (
        <TableCellLayout
          media={item.type === 'folder' ? <Folder24Regular /> : <Document24Regular />}
        >
          {item.name}
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointItem>({
      columnId: 'modified',
      renderHeaderCell: () => 'Modified',
      renderCell: (item) => (
        <TableCellLayout>
          {new Date(item.modified).toLocaleString()}
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointItem>({
      columnId: 'modifiedBy',
      renderHeaderCell: () => 'Modified By',
      renderCell: (item) => <TableCellLayout>{item.modifiedBy}</TableCellLayout>,
    }),
    createTableColumn<SharePointItem>({
      columnId: 'size',
      renderHeaderCell: () => 'Size',
      renderCell: (item) => (
        <TableCellLayout>
          {item.size ? `${(item.size / 1024).toFixed(2)} KB` : '-'}
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointItem>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (item) => (
        <TableCellLayout>
          <Button
            size="small"
            icon={<Delete24Regular />}
            onClick={() => handleDelete(item.id)}
          />
        </TableCellLayout>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title3>SharePoint Content Management</Title3>
          <Text>Manage documents, lists, and site content</Text>
        </div>
        <div className={styles.actions}>
          <Button
            appearance="primary"
            icon={<ArrowUpload24Regular />}
            onClick={handleUpload}
          >
            Upload
          </Button>
          <Button icon={<Add24Regular />}>New Folder</Button>
        </div>
      </div>

      <TabList
        className={styles.tabs}
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as string)}
      >
        <Tab value="documents">Documents</Tab>
        <Tab value="lists">Lists</Tab>
        <Tab value="pages">Pages</Tab>
      </TabList>

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="large" label="Loading SharePoint content..." />
        </div>
      ) : (
        <Card>
          <DataGrid
            items={items}
            columns={columns}
            sortable
            className={styles.grid}
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<SharePointItem>>
              {({ item, rowId }) => (
                <DataGridRow<SharePointItem> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </Card>
      )}
    </div>
  );
};

export default SharePointAdmin;
