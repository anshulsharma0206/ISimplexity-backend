const fs = require('fs');
const { MongoClient } = require('mongodb');

class Events {
  constructor() {
    this.eventHandlers = {};
    this.mongoClient = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    this.connectToMongo();
  }

  async connectToMongo() {
    try {
      await this.mongoClient.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  async logEvent(eventName) {
    try {
      const logMessage = `event --> ${eventName} ${new Date()}\n`;
      fs.appendFile('app.log', logMessage, (err) => {
        if (err) {
          console.error('Error writing to app.log:', err);
        }
      });
  
      const db = this.mongoClient.db('eventLibrary');
      const collection = db.collection('events');
  
      await collection.insertOne({
        event: eventName,
        triggerTime: new Date(),
      }, (error) => {
        if (error) {
          console.error('Error inserting document into MongoDB:', error);
        } else {
          console.log(`Event logged to MongoDB: ${eventName}`);
        }
      });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  // Register an event handler
  on(eventName, callback) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(callback);
  }

  // Trigger all callbacks associated with a given eventName
  trigger(eventName) {
    const handlers = this.eventHandlers[eventName];
    if (handlers) {
      handlers.forEach(callback => callback());
      this.logEvent(eventName);
    }
  }

  // Remove all event handlers associated with the given eventName
  off(eventName) {
    this.eventHandlers[eventName] = [];
  }

  async closeMongoConnection() {
    try {
      await this.mongoClient.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

module.exports = Events;
