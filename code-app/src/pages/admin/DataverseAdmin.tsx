import { FC, useState, useEffect } from 'react';
import {
  Title3,
  shorthands,
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
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from '@fluentui/react-components';
import { Database24Regular, Add24Regular, Edit24Regular, Delete24Regular, Table24Regular } from '@fluentui/react-icons';
import { dataverseClient } from '../../services/dataverse';

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
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
  },
  tableList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
  },
  tableCard: {
    padding: tokens.spacingVerticalL,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  selectedTable: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1),
  },
});

interface DataverseRecord {
  id: string;
  [key: string]: any;
}

const DataverseAdmin: FC = () => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState('cr6f1_users');
  const [records, setRecords] = useState<DataverseRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataverseRecord | null>(null);

  const tables = [
    { name: 'cr6f1_users', label: 'Users', icon: <Database24Regular /> },
    { name: 'cr6f1_events', label: 'Events', icon: <Table24Regular /> },
    { name: 'cr6f1_tasks', label: 'Tasks', icon: <Table24Regular /> },
    { name: 'cr6f1_notifications', label: 'Notifications', icon: <Table24Regular /> },
  ];

  useEffect(() => {
    if (selectedTable) {
      loadRecords();
    }
  }, [selectedTable]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await dataverseClient.query(selectedTable);
      setRecords((data as any[]).map((item: any) => ({ id: item[Object.keys(item)[0]], ...item })));
    } catch (error) {
      console.error('Failed to load records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord({ id: '' });
    setDialogOpen(true);
  };

  const handleEdit = (record: DataverseRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await dataverseClient.delete(selectedTable, id);
        setRecords(records.filter(r => r.id !== id));
      } catch (error) {
        console.error('Failed to delete record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const handleSave = async () => {
    if (!editingRecord) return;

    try {
      if (editingRecord.id) {
        // Update
        await dataverseClient.update(selectedTable, editingRecord.id, editingRecord);
      } else {
        // Create
        await dataverseClient.create(selectedTable, editingRecord);
      }
      await loadRecords();
      setDialogOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('Failed to save record');
    }
  };

  // Dynamic columns based on selected table
  const getColumns = (): TableColumnDefinition<DataverseRecord>[] => {
    if (records.length === 0) return [];

    const keys = Object.keys(records[0]).filter(key => key !== 'id');
    const columns: TableColumnDefinition<DataverseRecord>[] = keys.slice(0, 5).map(key =>
      createTableColumn<DataverseRecord>({
        columnId: key,
        renderHeaderCell: () => key,
        renderCell: (item) => <TableCellLayout>{String(item[key])}</TableCellLayout>,
      })
    );

    columns.push(
      createTableColumn<DataverseRecord>({
        columnId: 'actions',
        renderHeaderCell: () => 'Actions',
        renderCell: (item) => (
          <TableCellLayout>
            <div className={styles.actions}>
              <Button
                size="small"
                icon={<Edit24Regular />}
                onClick={() => handleEdit(item)}
              />
              <Button
                size="small"
                icon={<Delete24Regular />}
                onClick={() => handleDelete(item.id)}
              />
            </div>
          </TableCellLayout>
        ),
      })
    );

    return columns;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title3>Dataverse Management</Title3>
          <Text>Manage custom tables and data entities</Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={handleAdd}
          disabled={!selectedTable}
        >
          Add Record
        </Button>
      </div>

      <Card style={{ marginBottom: tokens.spacingVerticalL }}>
        <Title3 style={{ marginBottom: tokens.spacingVerticalM }}>Select Table</Title3>
        <div className={styles.tableList}>
          {tables.map((table) => (
            <Card
              key={table.name}
              className={`${styles.tableCard} ${selectedTable === table.name ? styles.selectedTable : ''}`}
              onClick={() => setSelectedTable(table.name)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                {table.icon}
                <Text weight="semibold">{table.label}</Text>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="large" label="Loading records..." />
        </div>
      ) : (
        <Card>
          <DataGrid
            items={records}
            columns={getColumns()}
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
            <DataGridBody<DataverseRecord>>
              {({ item, rowId }) => (
                <DataGridRow<DataverseRecord> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingRecord?.id ? 'Edit' : 'Add'} Record</DialogTitle>
            <DialogContent>
              <Text>Record editing form will be dynamically generated based on table schema.</Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={handleSave}>
                Save
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default DataverseAdmin;
