import type { ThemeConfig } from 'antd'

// Palette: cool graphite for structure, one deep teal for action. Nothing else is coloured,
// except the small category dots in the product table.
export const INK = '#10161d'
export const ACCENT = '#0f766e'
export const BORDER = '#e5e8ec'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: ACCENT,
    colorInfo: ACCENT,
    colorBgLayout: '#f3f5f7',
    colorTextBase: '#161b22',
    // Secondary and placeholder text stay readable (at least 4.5:1 on white).
    colorTextSecondary: '#4a5560',
    colorTextDescription: '#5b6570',
    colorTextPlaceholder: '#6b7580',
    colorInfoBg: '#eef6f5',
    colorInfoBorder: '#b7d8d4',
    colorBorder: '#d5dae0',
    colorBorderSecondary: BORDER,
    borderRadius: 10,
    borderRadiusLG: 14,
    controlHeight: 38,
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  components: {
    Layout: {
      siderBg: INK,
      headerBg: 'transparent',
      headerHeight: 60,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: INK,
      darkItemColor: '#aab3bd',
      darkItemHoverColor: '#ffffff',
      darkItemHoverBg: '#18212a',
      darkItemSelectedBg: '#16302f',
      darkItemSelectedColor: '#ffffff',
      itemHeight: 42,
      itemBorderRadius: 10,
    },
    Button: {
      defaultShadow: 'none',
      primaryShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      headerBg: 'transparent',
      headerColor: '#5b6570',
      headerSplitColor: 'transparent',
      rowHoverBg: '#f4faf9',
      cellPaddingBlock: 14,
      cellPaddingInline: 20,
      borderColor: '#edf0f3',
    },
    Segmented: {
      itemSelectedBg: '#ffffff',
      trackBg: '#eef0f3',
    },
  },
}
