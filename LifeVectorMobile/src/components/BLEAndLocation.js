import React from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationAndroid from 'react-native-push-notification';
import BackgroundTimer from 'react-native-background-timer'
import {Alert, DeviceEventEmitter} from 'react-native';
import newBLE from 'react-native-ble-manager';

module.exports = class BLEAndLocation {

  constructor(taskData){
    this.timeoutID = null;
    this.taskData = taskData;
    this.device = null;
    console.log(taskData);
    this.taskData.manager2.isPeripheralConnected(this.taskData.state.connected_peripheral, [])
      .then((isConnected) => {
        console.log("CONNECTED STATUS: " + isConnected);
      });

    PushNotificationAndroid.configure({

      // (required) Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        // if (notification.message == "Would you like to turn on Bluetooth services?"){
        //   if (notification.)
        // }
        PushNotification.cancelAllLocalNotifications();
        console.log('NOTIFICATION:', notification);
        if (notification.title == "Bluetooth connection required:") {
          if (notification.action == "Yes") {
            this.taskData.manager.enable()
              .then((message) => {
                console.log('Bluetooth is now enabled');
                PushNotification.cancelAllLocalNotifications();
                this.taskData.item.setState({
                  bl_alert: false
                });
              })
              .catch((error) => {
                console.log('Bluetooth failed to enable: ' + error);
                PushNotification.cancelAllLocalNotifications();
                this.taskData.item.setState({
                  bl_alert: false
                });
              });
          } else {
            PushNotification.cancelAllLocalNotifications();
            this.taskData.item.setState({
              bl_alert: false
            });
          }
        } else if (notification.title.startsWith("Life Vector server") && notification.title.endsWith("detected")) {
          if (notification.action == "Yes") {
            let message_array = notification.message.split(' ');
            let id = message_array[message_array.length - 1].substr(4).slice(0, -2);
            this.taskData.item.connect(id)
          } else {
            this.taskData.item.setState({
              connect_alert: false
            });
            PushNotification.cancelAllLocalNotifications();
          }
        }
      }
    });
  }
  connect(id) {
    // Proceed with connection.
    this.manager2.connect(device)
      .then((data) => {
        this.setState({
          connected_peripheral: device,
          is_connected: true,
          connect_alert: false
        });
        this.manager.stopDeviceScan();
      })
      .catch((error) => {
        this.setState({
          connect_alert: false
        });
      });

  }
  start(){
    this.timeoutID = this.taskData.timer.setInterval(() => {
//code that will be called every 3 seconds
        this.taskData.manager.state()
          .then((result)=>{
            if (result == "PoweredOff"){
              this.taskData.item.setState({
                bl_alert: true
              });
              PushNotificationAndroid.localNotification({
                title: "Bluetooth connection required",
                message: "Would you like to turn on Bluetooth services?",
                actions:'["Yes", "No"]',
              });
            } else {
              if (this.taskData.item.state.connected_peripheral != null){
                this.taskData.item.manager2.isPeripheralConnected(this.taskData.item.state.connected_peripheral, [])
                  .then((isConnected) => {
                    console.log(isConnected);
                    if (!isConnected){
                      this.taskData.item.setState({
                        connected_peripheral: null,
                        is_connected: false
                      });
                      this.scanAndConnect();
                    }
                  });
              } else {
                this.scanAndConnect();
              }
            }
          });
      },
      10000);
    return this.timeoutID;
  }

  scanAndConnect() {
    this.taskData.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        return
      }
      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (device.name != null && device.name.startsWith('lifepi')) {

        // Stop scanning as it's not necessary if you are scanning for one device.

        if (!this.taskData.item.state.connect_alert) {
          this.taskData.item.setState({
            connect_alert: true
          });
          PushNotificationAndroid.localNotification({
            title: "Life Vector server " + device.name + " detected",
            message: "Would you like to connect? (id:" + device.id + ")?",
            actions: '["Yes", "No"]',
          });
        }
      }
    });
  }


  end(id){
    this.taskData.timer.clearInterval(id);
    return this;
  }

};
