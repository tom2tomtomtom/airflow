import React from 'react';

export type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Minimal DashboardLayout wrapper for page content.
 * Customize as needed with navigation, sidebar, etc.
 */
export const DashboardLayout = ({ title, children }: DashboardLayoutProps) => (
  <div style={{ padding: 24 }}>
    <header style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{title}</h1>
    </header>
    <main>{children}</main>
  </div>
);

export default DashboardLayout;
