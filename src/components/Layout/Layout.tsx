import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
import "./Layout.css";

/**
 * Main Layout component with navigation sidebar
 */
const Layout: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    });
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/calendar", label: "Calendar", icon: "📅" },
    { path: "/reminders", label: "Reminders", icon: "⏰" },
    { path: "/chat", label: "AI Chat", icon: "💬" },
    { path: "/sharepoint", label: "SharePoint", icon: "📁" },
    { path: "/dataverse", label: "Dataverse", icon: "💾" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      <nav className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h1 className="app-title">{isSidebarCollapsed ? "PA" : "Power Apps"}</h1>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isSidebarCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          {isAuthenticated && accounts[0] ? (
            <div className="user-info">
              <div className="user-avatar">
                {accounts[0].name?.charAt(0).toUpperCase() || "U"}
              </div>
              {!isSidebarCollapsed && (
                <div className="user-details">
                  <span className="user-name">{accounts[0].name}</span>
                  <span className="user-email">{accounts[0].username}</span>
                </div>
              )}
              <button
                className="logout-button"
                onClick={handleLogout}
                title="Sign out"
              >
                {isSidebarCollapsed ? "↪" : "Sign out"}
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLogin}>
              {isSidebarCollapsed ? "→" : "Sign in"}
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
