import React, { useState, useEffect } from 'react';
import webSocketService from '../utils/webSocketService';

/**
 * Component to display real-time blockchain vote activities
 */
const BlockchainActivityFeed = ({ isAdmin = false }) => {
  const [activities, setActivities] = useState([]);
  const [connected, setConnected] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const connectAndSubscribe = async () => {
      try {
        // Connect to WebSocket
        await webSocketService.connect();
        
        if (!isMounted) return;

        setConnected(true);

        // Subscribe to appropriate topic based on user role
        const subId = isAdmin 
          ? webSocketService.subscribeToAdminActivities(handleActivity)
          : webSocketService.subscribeToActivities(handleActivity);

        setSubscriptionId(subId);
        
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnected(false);
      }
    };

    const handleActivity = (activity) => {
      if (!isMounted) return;

      // Only show blockchain vote activities
      if (activity.type === 'VOTE_CAST_BLOCKCHAIN') {
        setActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10 activities
      }
    };

    connectAndSubscribe();

    return () => {
      isMounted = false;
      if (subscriptionId) {
        webSocketService.unsubscribe(subscriptionId);
      }
    };
  }, [isAdmin, subscriptionId]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatTransactionHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  return (
    <div className="blockchain-activity-feed">
      <div className="activity-header">
        <h3>🔗 Blockchain Votes</h3>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>Waiting for blockchain votes...</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={`${activity.transactionHash}_${index}`} className="activity-item blockchain">
              <div className="activity-content">
                <div className="activity-main">
                  <span className="wallet-address">{activity.walletAddress}</span>
                  <span className="activity-text">voted for</span>
                  <span className="candidate-name">{activity.candidateName}</span>
                </div>
                <div className="activity-details">
                  <span className="transaction-hash" title={activity.transactionHash}>
                    Tx: {formatTransactionHash(activity.transactionHash)}
                  </span>
                  <span className="timestamp">{formatTimestamp(activity.timestamp)}</span>
                  <span className="block-number">Block #{activity.blockNumber}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .blockchain-activity-feed {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin: 20px 0;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .activity-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2em;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9em;
          font-weight: 500;
        }

        .connection-status.connected {
          color: #27ae60;
        }

        .connection-status.disconnected {
          color: #e74c3c;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .activity-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .no-activities {
          text-align: center;
          color: #7f8c8d;
          padding: 40px 20px;
        }

        .activity-item {
          padding: 12px 16px;
          margin: 8px 0;
          border-radius: 8px;
          border-left: 4px solid #3498db;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .activity-item.blockchain {
          border-left-color: #9b59b6;
          background: linear-gradient(45deg, #f8f9fa 0%, #e8f5e8 100%);
        }

        .activity-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .activity-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .activity-main {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .wallet-address {
          color: #8e44ad;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          background: rgba(142, 68, 173, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .candidate-name {
          color: #2c3e50;
          font-weight: 600;
        }

        .activity-text {
          color: #7f8c8d;
        }

        .activity-details {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8em;
          color: #95a5a6;
        }

        .transaction-hash {
          font-family: 'Courier New', monospace;
          background: rgba(52, 152, 219, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }

        .block-number {
          background: rgba(46, 204, 113, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .timestamp {
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .activity-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .activity-details {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlockchainActivityFeed;