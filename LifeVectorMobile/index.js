import React, { Component } from 'react';
import {
  AppRegistry,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
  NativeEventEmitter,
  NativeModules,
  Button,
  ToastAndroid,
  FlatList,
  Alert
} from 'react-native';
import LoginPage from './src/components/LoginPage';
import {DeviceInfo} from 'react-native-device-info';
import BLEPage from "./src/components/BLEPage";
import BarChart from "./src/components/BarChart";

export default class lifeVectorMobile extends Component {

  render() {
    return (
      <View style={styles.container}>
        <BLEPage/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    flex: 1,
    backgroundColor: '#3B3738',
    flexDirection: 'row'
  },
  app_title: {
    flex: 7,
    padding: 10
  },
  header_button_container: {
    flex: 2,
    justifyContent: 'center',
    paddingRight: 5
  },
  header_text: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold'
  },
  body: {
    flex: 19
  },
  list_item: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flex: 1,
    flexDirection: 'row'
  },
  list_item_text: {
    flex: 8,
    color: '#575757',
    fontSize: 18
  },
  list_item_button: {
    flex: 2
  },
  spinner: {
    alignSelf: 'center',
    marginTop: 30
  },
  attendees_container: {
    flex: 1
  }
});

AppRegistry.registerComponent('lifeVectorMobile', () => lifeVectorMobile);
