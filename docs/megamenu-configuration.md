# MegaMenu Configuration Guide

## Overview

The app now features a responsive megamenu that dynamically loads navigation items from a SharePoint list. The menu automatically falls back to default items if the SharePoint list is not available.

## SharePoint List Setup

### Create the Navigation Menu List

1. Navigate to your SharePoint site: `https://365evergreen.sharepoint.com/sites/aivana`
2. Go to **Site Contents** → **New** → **List**
3. Name it: **"Navigation Menu"**

### List Columns

Create the following columns in the SharePoint list:

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Title** | Single line of text | Yes | Display name of the menu item |
| **URL** | Single line of text | No | Link destination (use `/calendar`, `/tasks`, etc. for internal routes) |
| **Description** | Multiple lines of text | No | Description shown in the megamenu dropdown |
| **ParentId** | Single line of text | No | ID of the parent menu item (for sub-items) |
| **Order** | Number | No | Sort order (0, 10, 20, etc.) |
| **IsExternal** | Yes/No | No | Whether the link is to an external site |
| **OpenInNewTab** | Yes/No | No | Whether to open link in new tab |

### Sample Menu Structure

#### Top-Level Items

| Title | URL | Description | ParentId | Order | IsExternal | OpenInNewTab |
|-------|-----|-------------|----------|-------|------------|--------------|
| Home | / | Dashboard overview | (empty) | 0 | No | No |
| Work | (empty) | Work-related tools | (empty) | 10 | No | No |
| Resources | (empty) | Company resources | (empty) | 20 | No | No |
| External | (empty) | External links | (empty) | 30 | No | No |

#### Sub-Items (Children)

| Title | URL | Description | ParentId | Order | IsExternal | OpenInNewTab |
|-------|-----|-------------|----------|-------|------------|--------------|
| Calendar | /calendar | View and manage meetings | 2 | 10 | No | No |
| Tasks | /tasks | Manage your tasks | 2 | 20 | No | No |
| Documents | /documents | Browse documents | 3 | 10 | No | No |
| Settings | /settings | App preferences | 3 | 20 | No | No |
| SharePoint | https://365evergreen.sharepoint.com | Main SharePoint site | 4 | 10 | Yes | Yes |

**Note:** The `ParentId` should match the `ID` (auto-generated) of the parent item.

## Features

### Desktop Experience
- **Horizontal menu bar** with top-level items
- **Hover/click** to open megamenu dropdown
- **Multi-column layout** showing child items with descriptions
- **Click outside** to close menu
- **Smooth animations** with Fluent UI design

### Mobile Experience (< 1024px)
- **Hamburger menu button** (☰) opens full-screen menu
- **Expandable sections** for items with children
- **Touch-friendly** tap targets
- **Full-width** navigation drawer

### Tablet Experience (768px - 1024px)
- **Responsive grid** adapts column count
- **Touch and mouse** support
- **Optimized spacing** for medium screens

## Default Menu (Fallback)

If the SharePoint list is not available or fails to load, the app falls back to this default menu:

```typescript
[
  { id: '1', title: 'Dashboard', url: '/', order: 1 },
  { id: '2', title: 'Calendar', url: '/calendar', order: 2 },
  { id: '3', title: 'Tasks', url: '/tasks', order: 3 },
  { id: '4', title: 'Documents', url: '/documents', order: 4 },
  { id: '5', title: 'Settings', url: '/settings', order: 5 },
]
```

## Configuration

### Change SharePoint Site

Edit `src/components/MegaMenu/MegaMenu.tsx`:

```typescript
<MegaMenu 
  sitePath="/sites/aivana"  // Change this
  listName="Navigation Menu"  // Or change list name
/>
```

Or update in `Layout.tsx` when calling the component.

### Styling Customization

The megamenu uses Fluent UI design tokens. To customize:

1. **Colors**: Modify token references in `useStyles`
2. **Spacing**: Adjust `gap` and `padding` values
3. **Breakpoints**: Change `@media` query values
4. **Animation**: Add transitions to button hover states

## URL Patterns

### Internal Routes
Use relative paths without domain:
- `/` - Dashboard
- `/calendar` - Calendar page
- `/tasks` - Tasks page
- `/documents` - Documents page
- `/settings` - Settings page

### External Links
Use full URLs:
- `https://365evergreen.sharepoint.com`
- `https://teams.microsoft.com`
- Set `IsExternal` = Yes and optionally `OpenInNewTab` = Yes

## Testing Checklist

- [ ] SharePoint list created with correct columns
- [ ] Sample menu items added
- [ ] Top-level items display in desktop menu bar
- [ ] Child items show in megamenu dropdown
- [ ] Links navigate correctly
- [ ] External links open in new tab (if configured)
- [ ] Mobile menu opens and closes properly
- [ ] Menu items sort by Order value
- [ ] Fallback menu works if SharePoint unavailable
- [ ] Responsive design works on all screen sizes

## Permissions Required

The app needs these Microsoft Graph permissions:
- ✅ `Sites.Read.All` or `Sites.ReadWrite.All` - Read SharePoint lists
- ✅ Already configured in `auth.ts`

Ensure admin consent is granted in Azure AD.

## Troubleshooting

### Menu doesn't load from SharePoint

**Check:**
1. SharePoint list exists: `/sites/aivana/Lists/Navigation Menu`
2. List name matches exactly: "Navigation Menu"
3. User has read permissions to the list
4. API permissions granted in Azure AD
5. Console shows any error messages

**Fallback:** App will use default menu automatically.

### Menu items not sorted correctly

**Fix:** Add numeric values to the `Order` column (e.g., 0, 10, 20, 30...).

### Sub-items not showing

**Check:**
1. `ParentId` column has the correct parent item ID
2. Parent item exists in the list
3. Parent item has no URL (only children have URLs)

### Mobile menu not appearing

**Fix:** Screen width must be < 1024px. Check responsive design tools in browser DevTools.

## Advanced Features

### Hierarchical Navigation

Support 2 levels:
1. **Top-level**: Main categories (Work, Resources, etc.)
2. **Sub-items**: Specific pages under each category

To add more levels, modify the component logic.

### Icons

To add icons to menu items:
1. Add `IconName` column to SharePoint list
2. Update `MegaMenu.tsx` to import and render icons
3. Map icon names to Fluent UI icon components

### Analytics

Track menu clicks by adding analytics to `handleMenuClick`:

```typescript
const handleMenuClick = (item: MenuItem) => {
  // Add analytics
  trackEvent('menu_click', { item: item.title, url: item.url });
  
  // Existing navigation code...
};
```

## Future Enhancements

Potential features to add:
- 🎨 Icon support per menu item
- 🔒 Permission-based menu filtering
- 🌐 Multi-language support
- 📱 PWA home screen shortcuts
- 🔍 Search within menu
- ⭐ User favorites/pinned items
- 📊 Usage analytics
- 🎯 Contextual menus per page
- 🔔 Badge notifications on menu items
