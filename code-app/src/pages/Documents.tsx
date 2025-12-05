import { FC, useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Button,
  Card,
  Input,
  Spinner,
  Text,
  Body1,
  Caption1,
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
} from '@fluentui/react-components';
import { 
  Add24Regular, 
  Search24Regular,
  Document24Regular,
  Folder24Regular,
  ArrowDownload24Regular,
  Open24Regular,
} from '@fluentui/react-icons';
import { sharepointClient, SharePointFile } from '../services/sharepoint';

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
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  toolbar: {
    display: 'flex',
    ...shorthands.gap('12px'),
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      '& input': {
        width: '100%',
      },
      '& button': {
        width: '100%',
      },
    },
  },
  documentsContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('24px'),
    minHeight: '500px',
  },
  fileRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  fileIcon: {
    fontSize: '24px',
    marginRight: '12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    ...shorthands.gap('12px'),
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    ...shorthands.gap('12px'),
    color: tokens.colorPaletteRedForeground1,
  },
});

const Documents: FC = () => {
  const styles = useStyles();
  const [documents, setDocuments] = useState<SharePointFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await sharepointClient.getRecentFiles('/sites/aivana', 20);
      setDocuments(files);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please check your permissions and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const files = await sharepointClient.searchFiles('/sites/aivana', searchQuery);
      setDocuments(files);
    } catch (err) {
      console.error('Error searching documents:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const columns: TableColumnDefinition<SharePointFile>[] = [
    createTableColumn<SharePointFile>({
      columnId: 'name',
      renderHeaderCell: () => 'Name',
      renderCell: (item) => (
        <TableCellLayout
          media={
            item.folder ? (
              <Folder24Regular className={styles.fileIcon} />
            ) : (
              <Document24Regular className={styles.fileIcon} />
            )
          }
        >
          {item.name}
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointFile>({
      columnId: 'modified',
      renderHeaderCell: () => 'Modified',
      renderCell: (item) => (
        <TableCellLayout>
          <Caption1>{formatDate(item.lastModifiedDateTime)}</Caption1>
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointFile>({
      columnId: 'modifiedBy',
      renderHeaderCell: () => 'Modified By',
      renderCell: (item) => (
        <TableCellLayout>
          <Caption1>{item.lastModifiedBy?.user?.displayName || 'Unknown'}</Caption1>
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointFile>({
      columnId: 'size',
      renderHeaderCell: () => 'Size',
      renderCell: (item) => (
        <TableCellLayout>
          <Caption1>{item.file ? formatFileSize(item.size) : '-'}</Caption1>
        </TableCellLayout>
      ),
    }),
    createTableColumn<SharePointFile>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (item) => (
        <TableCellLayout>
          <Button
            appearance="subtle"
            size="small"
            icon={<Open24Regular />}
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.webUrl, '_blank');
            }}
          >
            Open
          </Button>
        </TableCellLayout>
      ),
    }),
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title3>Documents from Aivana Site</Title3>
        <Button appearance="primary" icon={<Add24Regular />} onClick={loadDocuments}>
          Refresh
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="Search documents..."
          contentBefore={<Search24Regular />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{ width: '400px' }}
        />
        <Button appearance="secondary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Card className={styles.documentsContainer}>
        {loading && (
          <div className={styles.emptyState}>
            <Spinner size="large" label="Loading documents..." />
          </div>
        )}

        {error && !loading && (
          <div className={styles.errorState}>
            <Text size={500}>{error}</Text>
            <Button appearance="primary" onClick={loadDocuments}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className={styles.emptyState}>
            <Document24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3 }} />
            <Body1>No documents found</Body1>
            <Caption1>Try searching or refreshing the list</Caption1>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <DataGrid
            items={documents}
            columns={columns}
            sortable
            getRowId={(item) => item.id}
          >
            <DataGridBody<SharePointFile>>
              {({ item, rowId }) => (
                <DataGridRow<SharePointFile>
                  key={rowId}
                  className={styles.fileRow}
                  onClick={() => window.open(item.webUrl, '_blank')}
                >
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}
      </Card>
    </div>
  );
};

export default Documents;
