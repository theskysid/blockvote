import React, { useState, useEffect, useRef } from 'react';
import webSocketService from '../utils/webSocketService';

const BlockchainConsole = ({ isCollapsed = false, onToggle }) => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const consoleRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const connectAndSubscribe = async () => {
      try {
        // Connect to WebSocket if not already connected
        if (!webSocketService.isConnected()) {
          await webSocketService.connect();
        }

        if (mounted) {
          setIsConnected(true);

          // Subscribe to admin blockchain console topic
          subscriptionRef.current = webSocketService.client.subscribe(
            '/topic/admin/blockchain-console',
            (message) => {
              try {
                const data = JSON.parse(message.body);
                if (mounted) {
                  setLogs(prevLogs => {
                    const newLogs = [...prevLogs, {
                      id: Date.now() + Math.random(),
                      message: data.message || data,
                      timestamp: new Date().toLocaleTimeString(),
                      type: data.type || 'info'
                    }];
                    // Keep only last 200 logs
                    return newLogs.slice(-200);
                  });
                }
              } catch (error) {
                console.error('Error parsing blockchain console message:', error);
              }
            }
          );

          // Add initial connection message
          setLogs([{
            id: Date.now(),
            message: '> Blockchain console connected',
            timestamp: new Date().toLocaleTimeString(),
            type: 'success'
          }]);
        }
      } catch (error) {
        console.error('Failed to connect to blockchain console:', error);
        if (mounted) {
          setLogs([{
            id: Date.now(),
            message: '> ⚠ Failed to connect to blockchain console',
            timestamp: new Date().toLocaleTimeString(),
            type: 'error'
          }]);
        }
      }
    };

    connectAndSubscribe();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const getMessageStyle = (type) => {
    switch (type) {
      case 'success':
        return { color: '#48bb78' };
      case 'error':
        return { color: '#f56565' };
      case 'warning':
        return { color: '#ed8936' };
      case 'info':
      default:
        return { color: '#4fd1c7' };
    }
  };

  if (isCollapsed) {
    return (
      <div style={styles.collapsedContainer}>
        <button
          onClick={onToggle}
          style={styles.expandButton}
          title="Expand Blockchain Console"
        >
          <span style={styles.expandIcon}>⚡</span>
          <span>Console</span>
          {logs.length > 0 && (
            <span style={styles.logCount}>{logs.length}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.title}>⚡ Blockchain Console</span>
          <div style={styles.statusIndicator(isConnected)}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </div>
        </div>
        <button
          onClick={onToggle}
          style={styles.collapseButton}
          title="Collapse Console"
        >
          ✕
        </button>
      </div>
      
      <div style={styles.console} ref={consoleRef}>
        {logs.length === 0 ? (
          <div style={styles.emptyMessage}>
            <div style={styles.emptyIcon}>⚡</div>
            <div>Waiting for blockchain activity...</div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={styles.logLine}>
              <span style={styles.timestamp}>[{log.timestamp}]</span>
              <span style={{...styles.message, ...getMessageStyle(log.type)}}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
      
      <div style={styles.footer}>
        <span style={styles.footerText}>
          {logs.length} entries • Auto-scroll enabled
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #333',
  },
  
  collapsedContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  },

  expandButton: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease',
  },

  expandIcon: {
    fontSize: '16px',
  },

  logCount: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    minWidth: '20px',
    textAlign: 'center',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#2d2d2d',
    borderBottom: '1px solid #404040',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  title: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
  },

  statusIndicator: (connected) => ({
    fontSize: '12px',
    color: connected ? '#48bb78' : '#f56565',
    fontWeight: '500',
  }),

  collapseButton: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s ease',
  },

  console: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    background: '#0d1117',
    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    minHeight: '300px',
    maxHeight: '500px',
  },

  emptyMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#666',
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },

  logLine: {
    display: 'flex',
    marginBottom: '8px',
    animation: 'fadeInUp 0.3s ease-out',
    opacity: 1,
  },

  timestamp: {
    color: '#666',
    marginRight: '12px',
    fontSize: '11px',
    minWidth: '80px',
    flexShrink: 0,
  },

  message: {
    color: '#4fd1c7',
    wordBreak: 'break-all',
    flex: 1,
  },

  footer: {
    padding: '8px 16px',
    background: '#2d2d2d',
    borderTop: '1px solid #404040',
    fontSize: '11px',
    color: '#888',
  },

  footerText: {
    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
  },
};

// Add CSS animation keyframes
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore if rule already exists
  }
}

export default BlockchainConsole;