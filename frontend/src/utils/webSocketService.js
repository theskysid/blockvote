import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocket service for real-time blockchain vote updates
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.client && this.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Create STOMP client with SockJS
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Connection established
      this.client.onConnect = (frame) => {
        console.log('WebSocket connected:', frame);
        this.connected = true;
        resolve();
      };

      // Connection error
      this.client.onStompError = (frame) => {
        console.error('WebSocket STOMP error:', frame);
        this.connected = false;
        reject(new Error(frame.body));
      };

      // WebSocket error
      this.client.onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
        this.connected = false;
        reject(new Error('WebSocket connection failed'));
      };

      // Connection closed
      this.client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.subscriptions.clear();
      };

      // Activate connection
      this.client.activate();
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  /**
   * Subscribe to blockchain activity updates
   * @param {Function} onMessage - Callback function for receiving messages
   * @returns {String} - Subscription ID for unsubscribing
   */
  subscribeToActivities(onMessage) {
    if (!this.connected) {
      console.error('WebSocket not connected. Call connect() first.');
      return null;
    }

    const subscriptionId = 'activities_' + Date.now();
    
    const subscription = this.client.subscribe('/topic/activities', (message) => {
      try {
        const data = JSON.parse(message.body);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Subscribe to admin activity updates (for admin dashboard)
   * @param {Function} onMessage - Callback function for receiving messages
   * @returns {String} - Subscription ID for unsubscribing
   */
  subscribeToAdminActivities(onMessage) {
    if (!this.connected) {
      console.error('WebSocket not connected. Call connect() first.');
      return null;
    }

    const subscriptionId = 'admin_activities_' + Date.now();
    
    const subscription = this.client.subscribe('/topic/admin/activities', (message) => {
      try {
        const data = JSON.parse(message.body);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Subscribe to admin blockchain console (for admin blockchain console panel)
   * @param {Function} onMessage - Callback function for receiving messages
   * @returns {String} - Subscription ID for unsubscribing
   */
  subscribeToBlockchainConsole(onMessage) {
    if (!this.connected) {
      console.error('WebSocket not connected. Call connect() first.');
      return null;
    }

    const subscriptionId = 'blockchain_console_' + Date.now();
    
    const subscription = this.client.subscribe('/topic/admin/blockchain-console', (message) => {
      try {
        const data = JSON.parse(message.body);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a topic
   * @param {String} subscriptionId - The subscription ID returned from subscribe methods
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.connected;
  }
}

// Create and export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;