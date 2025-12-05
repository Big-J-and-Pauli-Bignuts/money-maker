import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import type { DataverseRecord } from "../../types";
import { dataverseRequest } from "../../config/authConfig";
import { dataverseService } from "../../services";
import "./NLP.css";

/**
 * Dataverse Component for querying and managing Dataverse data
 */
const DataversePage: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [selectedEntity, setSelectedEntity] = useState("contacts");
  const [records, setRecords] = useState<DataverseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Available entities
  const entities = useMemo(() => [
    { name: "contacts", label: "Contacts", icon: "👤" },
    { name: "accounts", label: "Accounts", icon: "🏢" },
    { name: "leads", label: "Leads", icon: "🎯" },
    { name: "opportunities", label: "Opportunities", icon: "💰" },
    { name: "tasks", label: "Tasks", icon: "✅" },
  ], []);

  // Sample records for demonstration
  const sampleRecords: Record<string, DataverseRecord[]> = useMemo(() => ({
    contacts: [
      {
        id: "1",
        entityType: "contacts",
        attributes: {
          fullname: "John Smith",
          emailaddress1: "john.smith@example.com",
          telephone1: "+1 (555) 123-4567",
          jobtitle: "Marketing Director",
          company: "Contoso Ltd",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
      {
        id: "2",
        entityType: "contacts",
        attributes: {
          fullname: "Jane Doe",
          emailaddress1: "jane.doe@example.com",
          telephone1: "+1 (555) 987-6543",
          jobtitle: "Sales Manager",
          company: "Fabrikam Inc",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
      {
        id: "3",
        entityType: "contacts",
        attributes: {
          fullname: "Bob Wilson",
          emailaddress1: "bob.wilson@example.com",
          telephone1: "+1 (555) 456-7890",
          jobtitle: "CEO",
          company: "Adventure Works",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
    ],
    accounts: [
      {
        id: "a1",
        entityType: "accounts",
        attributes: {
          name: "Contoso Ltd",
          emailaddress1: "info@contoso.com",
          telephone1: "+1 (555) 100-2000",
          websiteurl: "https://contoso.com",
          industry: "Technology",
          revenue: "$50M",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
      {
        id: "a2",
        entityType: "accounts",
        attributes: {
          name: "Fabrikam Inc",
          emailaddress1: "contact@fabrikam.com",
          telephone1: "+1 (555) 200-3000",
          websiteurl: "https://fabrikam.com",
          industry: "Manufacturing",
          revenue: "$120M",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
    ],
    leads: [
      {
        id: "l1",
        entityType: "leads",
        attributes: {
          fullname: "Sarah Johnson",
          emailaddress1: "sarah.j@prospect.com",
          companyname: "New Horizons LLC",
          leadqualitycode: "Hot",
          estimatedvalue: "$25,000",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
      {
        id: "l2",
        entityType: "leads",
        attributes: {
          fullname: "Mike Chen",
          emailaddress1: "mike.c@startup.io",
          companyname: "Tech Startup Inc",
          leadqualitycode: "Warm",
          estimatedvalue: "$15,000",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
    ],
    opportunities: [
      {
        id: "o1",
        entityType: "opportunities",
        attributes: {
          name: "Enterprise License Deal",
          estimatedvalue: "$150,000",
          closeprobability: "75%",
          estimatedclosedate: "2024-03-15",
          salesstage: "Proposal",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
    ],
    tasks: [
      {
        id: "t1",
        entityType: "tasks",
        attributes: {
          subject: "Follow up with Contoso",
          description: "Call regarding Q4 contract renewal",
          prioritycode: "High",
          scheduledend: "2024-01-20",
          statuscode: "Open",
        },
        createdOn: new Date(),
        modifiedOn: new Date(),
      },
    ],
  }), []);

  // Load records for selected entity
  const loadRecords = useCallback(async () => {
    if (!isAuthenticated) {
      setRecords(sampleRecords[selectedEntity] || []);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        ...dataverseRequest,
        account: accounts[0],
      });

      dataverseService.setAccessToken(response.accessToken);
      const data = await dataverseService.queryRecords(selectedEntity);
      setRecords(data);
    } catch (err) {
      console.error("Error loading Dataverse records:", err);
      setError("Failed to load data. Using sample data for demonstration.");
      setRecords(sampleRecords[selectedEntity] || []);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedEntity, instance, accounts, sampleRecords]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadRecords();
      return;
    }

    const filtered = (sampleRecords[selectedEntity] || []).filter((record) => {
      const values = Object.values(record.attributes).map((v) =>
        String(v).toLowerCase()
      );
      return values.some((v) => v.includes(searchQuery.toLowerCase()));
    });
    setRecords(filtered);
  };

  // Handle sign in for Dataverse
  const handleSignIn = async () => {
    try {
      await instance.loginPopup(dataverseRequest);
      loadRecords();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Get display fields for entity
  const getDisplayFields = (entity: string): string[] => {
    switch (entity) {
      case "contacts":
        return ["fullname", "emailaddress1", "telephone1", "jobtitle", "company"];
      case "accounts":
        return ["name", "emailaddress1", "telephone1", "industry", "revenue"];
      case "leads":
        return ["fullname", "companyname", "emailaddress1", "leadqualitycode", "estimatedvalue"];
      case "opportunities":
        return ["name", "estimatedvalue", "closeprobability", "salesstage"];
      case "tasks":
        return ["subject", "prioritycode", "scheduledend", "statuscode"];
      default:
        return [];
    }
  };

  // Format field name for display
  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .replace(/1$/, "")
      .replace("emailaddress", "Email")
      .replace("telephone", "Phone")
      .replace("fullname", "Name")
      .replace("jobtitle", "Job Title")
      .replace("companyname", "Company")
      .replace("leadqualitycode", "Quality")
      .replace("estimatedvalue", "Value")
      .replace("closeprobability", "Probability")
      .replace("estimatedclosedate", "Close Date")
      .replace("salesstage", "Stage")
      .replace("prioritycode", "Priority")
      .replace("scheduledend", "Due Date")
      .replace("statuscode", "Status")
      .replace("websiteurl", "Website");
  };

  return (
    <div className="dataverse-page">
      <div className="page-header">
        <h1>💾 Dataverse</h1>
        <p>Access and manage your Dataverse data</p>
      </div>

      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>Sign in to access your Dataverse data</p>
          <button className="sign-in-btn" onClick={handleSignIn}>
            Sign in with Microsoft
          </button>
          <p className="demo-note">Showing sample data for demonstration</p>
        </div>
      )}

      {/* Entity Tabs */}
      <div className="entity-tabs">
        {entities.map((entity) => (
          <button
            key={entity.name}
            className={`entity-tab ${selectedEntity === entity.name ? "active" : ""}`}
            onClick={() => setSelectedEntity(entity.name)}
          >
            <span className="entity-icon">{entity.icon}</span>
            {entity.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={`Search ${selectedEntity}...`}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          🔍 Search
        </button>
        <button onClick={loadRecords} disabled={isLoading} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message info">
          <span>ℹ️</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      {/* Records Table */}
      <div className="records-container">
        {records.length > 0 ? (
          <table className="records-table">
            <thead>
              <tr>
                {getDisplayFields(selectedEntity).map((field) => (
                  <th key={field}>{formatFieldName(field)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {getDisplayFields(selectedEntity).map((field) => (
                    <td key={field}>{String(record.attributes[field] || "-")}</td>
                  ))}
                  <td className="actions-cell">
                    <button className="action-btn view" title="View">
                      👁️
                    </button>
                    <button className="action-btn edit" title="Edit">
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isLoading && (
            <div className="empty-state">
              <p>No {selectedEntity} found</p>
              <button onClick={loadRecords}>Load data</button>
            </div>
          )
        )}
      </div>

      {/* Record Count */}
      {records.length > 0 && (
        <div className="record-count">
          Showing {records.length} {selectedEntity}
        </div>
      )}
    </div>
  );
};

export default DataversePage;
