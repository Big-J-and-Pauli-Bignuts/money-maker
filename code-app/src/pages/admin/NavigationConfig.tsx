import { FC, useState, useEffect } from 'react';
import {
  Title3,
  Text,
  Button,
  Input,
  Label,
  Switch,
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
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from '@fluentui/react-components';
import { Add24Regular, Edit24Regular, Delete24Regular, Save24Regular } from '@fluentui/react-icons';
import { sharepointClient } from '../../services/sharepoint';

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
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  grid: {
    marginTop: tokens.spacingVerticalL,
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
  },
});

interface MenuItem {
  id: string;
  title: string;
  url: string;
  order: number;
  parentId?: string;
  isExternal: boolean;
  openInNewTab: boolean;
}

const NavigationConfig: FC = () => {
  const styles = useStyles();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await sharepointClient.getListItems('Navigation Menu', '/sites/aivana');
      setMenuItems(items.map((item: any) => ({
        id: item.Id,
        title: item.Title,
        url: item.URL,
        order: item.Order || 0,
        parentId: item.ParentId,
        isExternal: item.IsExternal || false,
        openInNewTab: item.OpenInNewTab || false,
      })));
    } catch (error) {
      console.error('Failed to load menu items:', error);
      // Use default items if SharePoint list doesn't exist
      setMenuItems([
        { id: '1', title: 'Dashboard', url: '/', order: 1, isExternal: false, openInNewTab: false },
        { id: '2', title: 'Calendar', url: '/calendar', order: 2, isExternal: false, openInNewTab: false },
        { id: '3', title: 'Tasks', url: '/tasks', order: 3, isExternal: false, openInNewTab: false },
        { id: '4', title: 'Documents', url: '/documents', order: 4, isExternal: false, openInNewTab: false },
      ]);
    }
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      title: '',
      url: '',
      order: menuItems.length + 1,
      isExternal: false,
      openInNewTab: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
      // TODO: Delete from SharePoint
    }
  };

  const handleSave = () => {
    if (!editingItem) return;

    if (editingItem.id) {
      // Update existing
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
    } else {
      // Add new
      setMenuItems([...menuItems, { ...editingItem, id: Date.now().toString() }]);
    }

    // TODO: Save to SharePoint
    setDialogOpen(false);
    setEditingItem(null);
  };

  const columns: TableColumnDefinition<MenuItem>[] = [
    createTableColumn<MenuItem>({
      columnId: 'title',
      renderHeaderCell: () => 'Title',
      renderCell: (item) => <TableCellLayout>{item.title}</TableCellLayout>,
    }),
    createTableColumn<MenuItem>({
      columnId: 'url',
      renderHeaderCell: () => 'URL',
      renderCell: (item) => <TableCellLayout>{item.url}</TableCellLayout>,
    }),
    createTableColumn<MenuItem>({
      columnId: 'order',
      renderHeaderCell: () => 'Order',
      renderCell: (item) => <TableCellLayout>{item.order}</TableCellLayout>,
    }),
    createTableColumn<MenuItem>({
      columnId: 'type',
      renderHeaderCell: () => 'Type',
      renderCell: (item) => (
        <TableCellLayout>
          {item.isExternal ? 'External' : 'Internal'}
        </TableCellLayout>
      ),
    }),
    createTableColumn<MenuItem>({
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
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title3>Navigation Menu Configuration</Title3>
          <Text>Manage mega menu items and navigation structure</Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={handleAdd}
        >
          Add Menu Item
        </Button>
      </div>

      <Card>
        <DataGrid
          items={menuItems}
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
          <DataGridBody<MenuItem>>
            {({ item, rowId }) => (
              <DataGridRow<MenuItem> key={rowId}>
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Menu Item</DialogTitle>
            <DialogContent>
              {editingItem && (
                <>
                  <div className={styles.formRow}>
                    <Label>Title</Label>
                    <Input
                      value={editingItem.title}
                      onChange={(_,  data) => setEditingItem({ ...editingItem, title: data.value })}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <Label>URL</Label>
                    <Input
                      value={editingItem.url}
                      onChange={(_,  data) => setEditingItem({ ...editingItem, url: data.value })}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={editingItem.order.toString()}
                      onChange={(_,  data) => setEditingItem({ ...editingItem, order: parseInt(data.value) || 0 })}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <Switch
                      checked={editingItem.isExternal}
                      onChange={(_,  data) => setEditingItem({ ...editingItem, isExternal: data.checked })}
                      label="External Link"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <Switch
                      checked={editingItem.openInNewTab}
                      onChange={(_,  data) => setEditingItem({ ...editingItem, openInNewTab: data.checked })}
                      label="Open in New Tab"
                    />
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" icon={<Save24Regular />} onClick={handleSave}>
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

export default NavigationConfig;
