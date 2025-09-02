import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs } from '../utils/api';
import { formatDateTime } from '../utils/dateUtils';

export type AuditLog = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  details: any;
  timestamp: string;
  userId: string;
  user?: {
    email: string;
    role: string;
  };
};

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await getAuditLogs();
      setAuditLogs(logs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit logs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_CLASS':
      case 'CREATE_SESSION':
        return '#27ae60';
      case 'BOOK_SESSION':
        return '#3498db';
      case 'CANCEL_BOOKING':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="no-scroll-container">
        <div className="content-area">
          <div className="box-container">
            <div className="box-header">
              <h1 style={{ margin: 0, color: '#2c3e50' }}>Access Denied</h1>
            </div>
            <div className="box-content">
              <p>Only administrators can view audit logs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="no-scroll-container">
        <div className="content-area">
          <div className="box-container">
            <div className="box-header">
              <h1 style={{ margin: 0, color: '#2c3e50' }}>Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-scroll-container">
        <div className="content-area">
          <div className="box-container">
            <div className="box-header">
              <h1 style={{ margin: 0, color: '#2c3e50' }}>Error</h1>
            </div>
            <div className="box-content">
              <p>Error: {error}</p>
              <button onClick={fetchAuditLogs}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div className="box-container" style={{
          border: '2px solid rgba(231, 76, 60, 0.6)',
        }}>
          <div className="box-header">
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              📊 System Audit Logs
            </h1>
          </div>

          <div className="box-content">
            <div className="scrollable-content">
              {auditLogs && auditLogs.length > 0 ? (
                <div className="audit-logs-grid">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="audit-log-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            color: '#2c3e50', 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.1rem'
                          }}>
                            {log.action.replace(/_/g, ' ')}
                          </h3>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                            <strong>Entity:</strong> {log.entity} 
                            {/* (ID: {log.entityId}) */}
                          </p>
                          {log.user && (
                            <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                              <strong>User:</strong> {log.user.email} ({log.user.role})
                            </p>
                          )}
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                            <strong>Timestamp:</strong> {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: getActionColor(log.action),
                          color: '#fff',
                          whiteSpace: 'nowrap',
                        }}>
                          {log.action}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                  <p>No audit logs found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
