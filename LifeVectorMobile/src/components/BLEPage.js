import React, { Component } from 'react';
import {
    AppRegistry,
    Platform,
    PermissionsAndroid,
    StyleSheet,
    Text,
    View,
    NativeEventEmitter,
    DeviceEventEmitter,
    NativeModules,
    Button,
    ToastAndroid,
    FlatList,
    Alert,
    AppState
} from 'react-native';
import LoginPage from './LoginPage';
import BackgroundTimer from 'react-native-background-timer';
import BLEAndLocation from './BLEAndLocation';
import newBLE from 'react-native-ble-manager';
import { AsyncStorage } from "react-native";
import { bytesToString, stringToBytes } from 'convert-string';
const uniqueId = require('react-native-unique-id');
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
var forge = require('node-forge');

import { BleManager } from 'react-native-ble-plx';
const GLOBAL = require('./libraries/globals');

export default class BLEPage extends Component {

    constructor() {
        super();
        this.manager = new BleManager();
        this.manager2 = newBLE;
        this.connectionID = null;
        this.state = {
            is_scanning: false,
            connected_peripheral: null,
            connect_alert: false,
            bl_alert: false,
            appState: AppState.currentState,
            is_connected: false
        };
        this.public_key = null;
        this.private_key = null;
        this.background = null;
        this.bkgdID = null;
        this.dev_id = null;
        this.AES_key = null;
        this.AES_iv = null;

        this.peripherals = [];

        this.openBox = this.openBox.bind(this);

        this.manager.state()
            .then((result)=>{
                if (result == "PoweredOff"){
                    Alert.alert(
                        'Bluetooth is turned off',
                        'Would you like to turn on bluetooth for this app?',
                        [
                            {text: 'OK', onPress: () => {
                                this.manager.enable()
                                    .then((message) => {
                                        console.log('Bluetooth is already enabled');
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        Alert.alert('You need to enable bluetooth to use this app.', error.message);
                                    });
                            }},
                            {text: 'Cancel', onPress: () => {
                            }, style: 'cancel'},
                        ],
                        { onDismiss: () => {} }
                    )
                }
            });



        if(Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (!result) {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (!result) {
                            Alert.alert('You need to give access to coarse location to use this app.', '');
                        }
                    });
                }
            });
        }
        this.manager2.start({showAlert: false});
        this.manager2.getConnectedPeripherals([])
            .then((peripheralsArray) => {
                for (var i = 0; i < peripheralsArray.length; i++) {
                    if(peripheralsArray[i].name != null && peripheralsArray[i].name.startsWith('lifepi')){
                        this.connect(peripheralsArray[i].id, true);
                    }
                }
            });

        AsyncStorage.getItem('public_key', (err, result) => {
            AsyncStorage.getItem('private_key', (err1, result1) => {
                if (result == null || result1 == null){
                    forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
                        console.log(keypair);
                        var pub_key = forge.pki.publicKeyToPem(keypair.publicKey);
                        AsyncStorage.setItem('public_key', pub_key, () => {
                            console.log("Successfully saved public key");
                            this.public_key = pub_key;
                        });
                        var priv_key = forge.pki.privateKeyToPem(keypair.privateKey);
                        AsyncStorage.setItem('private_key', priv_key, () => {
                            console.log("Successfully saved private key");
                            this.private_key = priv_key;
                        });
                    });

                } else {
                    this.public_key = result;
                    this.private_key = result1;
                }

            });
        });

        AsyncStorage.getItem('AES_key', (err, result) => {
            AsyncStorage.getItem('AES_iv', (err1, result1) => {
                if (!(err || err1 || !result || !result1)) {
                    this.AES_key = result;
                    this.AES_iv = result1;
                }
            });
        });


        uniqueId()
            .then(id => {
                this.dev_id = id;
            })
            .catch(error => console.error(error))

    }
    string_format =  function(str, id) {
        var actualReturn = "";
        var returnString = id + ':[START]' + str;
        var firstPart = returnString.slice(0, 512);
        var secondPart = returnString.slice(512);
        actualReturn += firstPart;
        if (secondPart != "") {
            var fragments = this.string_chop(secondPart, 475);
            for (var i = 0; i < fragments.length; i++) {
                actualReturn += id;
                actualReturn += ":";
                actualReturn += fragments[i];
            }
        }
        actualReturn += "[END]";
        return actualReturn;
    };
    string_chop =  function(str, size){
        if (str == null) return [];
        str = String(str);
        size = ~~size;
        return size > 0 ? str.match(new RegExp('(.|[\\r\\n]){1,' + size + '}', 'g')) : [str];
    };

    convertPKCS1toPKCS8(input_key){
        var no_newlines = input_key.replace(/(\r\n\t|\n|\r\t)/gm,"");
        var remove_header_footer = no_newlines.replace(/-----.{3,5} RSA PUBLIC KEY-----/g, "");
        remove_header_footer = GLOBAL.PKCS8_32 + remove_header_footer;
        var new_string = "";
        while (remove_header_footer.length > 0){
            new_string += remove_header_footer.substring(0,64) + '\n';
            remove_header_footer = remove_header_footer.substring(64);
        }
        new_string = GLOBAL.PKCS8_HEADER + new_string + GLOBAL.PKCS8_FOOTER;
        return new_string
    }

    componentDidUpdate(prevProps, prevState){
        if (this.state.is_connected !== prevState.is_connected){
            if (this.state.is_connected == true){
                AsyncStorage.getItem('public_key', (err, result) => {
                    var sendData = result;
                    console.log(sendData);
                    // var sendData = this.convertPKCS1toPKCS8(result);
                    // To enable BleManagerDidUpdateValueForCharacteristic listener
                    var that = this;
                    setTimeout(()=>{
                        that.manager2.startNotification(that.state.connected_peripheral, GLOBAL.NON_SECURE_CHANNEL, GLOBAL.KEY_TRANSFER)
                            .then(() => {
                                setTimeout(()=>{
                                    that.manager2.write(that.state.connected_peripheral, GLOBAL.NON_SECURE_CHANNEL, GLOBAL.KEY_TRANSFER, stringToBytes(that.string_format(sendData, that.dev_id)), GLOBAL.MTU_SIZE)
                                        .then((value) => {
                                            console.log(String.fromCharCode.apply(null, value));
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })
                                }, 5000);
                            });
                    }, 5000);
                });

            }
        }
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    connect(device) {
        // Proceed with connection.
        this.manager2.connect(device)
            .then((data) => {
                this.connectionID = setInterval(()=> {
                    this.manager2.isPeripheralConnected(device)
                        .then((isCOn) => {
                            if(!isCOn){
                                this.connect(device);
                            } else {
                                this.setState({
                                    connected_peripheral: device,
                                    is_connected: true,
                                    connect_alert: false
                                });
                                clearInterval(this.connectionID);
                            }
                        })
                        .catch((error)=>{
                            console.log(error);
                        });
                    this.manager.stopDeviceScan();
                }, 100);

            })
            .catch((error) => {
                this.setState({
                    connect_alert: false
                });
            });

    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, {'allowDuplicates': false}, (error, device) => {
            if (error){
                return
            }
            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device != null && device.name != null && device.name.startsWith('lifepi')) {
                // Stop scanning as it's not necessary if you are scanning for one device.
                if (!this.state.connect_alert) {
                    this.setState({
                        connect_alert: true
                    });
                    Alert.alert(
                        'Server Detected',
                        'Would you like to connect to ' + device.name + "?",
                        [
                            {text: 'OK', onPress: () => {
                                this.connect(device.id);
                            }},
                            {text: 'Cancel', onPress: () => {
                                this.setState({
                                    connect_alert: false
                                });
                            }, style: 'cancel'},
                        ],
                        { onDismiss: () => {this.setState({
                            connect_alert: false
                        });} }
                    )
                }

            }
        })

    }

    checkForScanning(){
        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (device)=> {

        });
    }

    backgroundScanCheck() {

        this.manager.state()
            .then((result) => {
                if (result == "PoweredOff") {
                    if (!this.state.bl_alert) {
                        this.setState({
                            bl_alert: true
                        });
                        Alert.alert(
                            'Bluetooth is turned off',
                            'Would you like to turn on bluetooth for this app?',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                    this.manager.enable()
                                        .then((message) => {
                                            console.log('Bluetooth is already enabled');
                                            this.setState({
                                                bl_alert: false
                                            });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            Alert.alert('You need to enable bluetooth to use this app.', error.message);
                                            this.setState({
                                                bl_alert: false
                                            });
                                        });
                                }
                                },
                                {
                                    text: 'Cancel', onPress: () => {
                                    this.setState({
                                        bl_alert: false
                                    });
                                }, style: 'cancel'
                                },
                            ],
                            {
                                onDismiss: () => {
                                    this.setState({
                                        bl_alert: false
                                    });
                                }
                            }
                        )
                    }
                } else {
                    if (this.state.connected_peripheral != null) {
                        this.manager2.isPeripheralConnected(this.state.connected_peripheral, [])
                            .then((isConnected) => {
                                if (!isConnected) {
                                    this.setState({
                                        connected_peripheral: null,
                                        is_connected: false
                                    });
                                    this.scanAndConnect();
                                } else {
                                    console.log("Device is connected");
                                    this.setState({
                                        is_connected: true
                                    });

                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                    } else {
                        this.scanAndConnect();
                    }
                }
            });
    }



    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            try {
                let retValue = this.background.end(this.bkgdID);
                this.manager = retValue.taskData.manager;
                this.setState({connected_peripheral: retValue.taskData.item.state.connected_peripheral, is_connected: retValue.taskData.item.is_connected})
            } catch (error){
                console.log(error);
            } finally {

            }

        } else if (nextAppState == 'background'){
            this.manager.stopDeviceScan();
            this.background = new BLEAndLocation({'timer': BackgroundTimer, 'manager2': this.manager2, 'manager': this.manager, "state": this.state, "item": this});
            this.bkgdID = this.background.start();
        }
        this.setState({appState: nextAppState});

    };

    // componentDidUpdate(){
    //   this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
    //     .then((data) =>{
    //       console.log(data);
    //     });
    // }
    hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g).map(function(a) {
            return String.fromCharCode(parseInt(a, 16));
        }).join(""));
    }

    componentDidMount() {
        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
                console.log(characteristic);
                if (characteristic.toUpperCase() == GLOBAL.KEY_TRANSFER) {
                    // Convert bytes array to string
                    console.log(value);
                    const data = bytesToString(value);
                    console.log(data.length);
                    if (data == "already logged in") {
                        AsyncStorage.getItem('AES_key', (err, result) => {
                            AsyncStorage.getItem('AES_iv', (err, result1) => {
                                this.AES_key = result;
                                this.AES_iv = result1;
                            });
                        });
                    } else {
                        setTimeout(() => {
                            console.log('here: ' + this.private_key);
                            var privateKey = forge.pki.privateKeyFromPem(this.private_key);
                            var encodedMessage = privateKey.decrypt(data);
                            var AES_key = encodedMessage.match("\\[key:\\](.*)\\[iv:\\]")[1];
                            var AES_iv = encodedMessage.match("\\[iv:\\](.*)")[1];
                            this.AES_key = AES_key;
                            this.AES_iv = AES_iv;
                            AsyncStorage.setItem('AES_key', AES_key, () => {
                                console.log("Successfully saved aes key");
                            });

                            // An example 128-bit key
                            var base64Encrypted = this.encrypt("Pass back",this.AES_key, this.AES_iv);
                            var that = this;
                            setTimeout(()=>{
                                that.manager2.startNotification(that.state.connected_peripheral, GLOBAL.NON_SECURE_CHANNEL, GLOBAL.KEY_TEST)
                                    .then(() => {
                                        setTimeout(()=> {
                                            that.manager2.write(that.state.connected_peripheral, GLOBAL.NON_SECURE_CHANNEL, GLOBAL.KEY_TEST, stringToBytes(that.string_format(base64Encrypted, that.dev_id)), GLOBAL.MTU_SIZE)
                                                .then((value) => {
                                                    console.log(String.fromCharCode.apply(null, value));
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                })
                                        },5000);

                                    });
                            }, 5000);
                        }, 10000);
                    }
                }else if (characteristic.toUpperCase() == GLOBAL.KEY_TEST){
                    const data = bytesToString(value);
                    this.decrypt(data, this.AES_key, this.AES_iv);
                }

            }
        );
        this.checkForScanning();
        AppState.addEventListener('change', this._handleAppStateChange);
        this.timeoutID = setInterval(()=>{this.backgroundScanCheck();},5000);
        /*this.saveCoordinates();*/
    }


    /*saveCoordinates = () => {
        navigator.geolocation.watchPosition(
            position => {
                const location = position;
                AsyncStorage.getItem("lat_lng_array", (err, result) => {
                    var date = new Date();
                    var timestamp = date.getTime();
                    result[result.length].latitude = location.coords.latitude;
                    result[result.length].longitude = location.coords.longitude;
                    result[result.length].timestamp = timestamp;
                    AsyncStorage.setItem("lat_lng_array", result, () => {
                        console.log("Successfully saved coordinates to json");
                    });
                })

            },
            error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };*/

    encrypt(text, passKey, iv){

        var cipher = forge.cipher.createCipher('AES-CTR', forge.util.decode64(passKey));
        console.log(forge.util.decode64(passKey));
        console.log(forge.util.decode64(iv));
        cipher.start({iv: forge.util.decode64(iv)});
        cipher.update(forge.util.createBuffer(text));
        cipher.finish();
        var encrypted = cipher.output;



        // To print or store the binary data, you may convert it to hex
        var encryptedHex = encrypted.toHex();
        //Convert to Base64 String
        return "[Len:" +text.length.toString() + "]" + this.hexToBase64(encryptedHex);
    }
    decrypt(cipher, passKey, iv){
        var decipher = forge.cipher.createDecipher('AES-CTR', forge.util.decode64(passKey));
        decipher.start({iv: forge.util.decode64(iv)});
        decipher.update(forge.util.createBuffer(cipher));
        var result = decipher.finish(); // check 'result' for true/false
        // outputs decrypted hex
        console.log(decipher.output);

        return decipher.output;
    }
    disconnect(){
        this.manager2.disconnect(this.state.connected_peripheral)
            .then(() => {
                this.manager.disable()
                    .then(() =>{
                        this.manager.enable()
                            .then(() =>{
                                this.setState({
                                    connected_peripheral: null,
                                    is_connected: false
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                    })
            })
            .catch((error) => {
                // Failure code
                console.log(error);
            });
    }




    renderItem({item}) {

        if(item.full_name){           return (
            <View style={styles.list_item} key={item.id}>
                <Text style={styles.list_item_text}>{item.full_name}</Text>
                <Text style={styles.list_item_text}>{item.time_entered}</Text>
            </View>
        );
        }

        return (
            <View style={styles.list_item} key={item.id}>
                <Text style={styles.list_item_text}>{item.name}</Text>
                <Button
                    title="Connect"
                    color="#1491ee"
                    style={styles.list_item_button}
                    onPress={this.connect.bind(this, item.id)} />
            </View>
        );
    }


    openBox() {
        this.setState({
            promptVisible: true
        });
    }

    render() {
        return (
            <View style={{height: '100%'}}>
                <LoginPage/>
                <View style={{flexDirection: 'column', flex: 0}}>
                    {
                        this.state.connected_peripheral != null && <Button title="Disconnect From Server" color="#1491ee" onPress={()=>{this.disconnect(this.state.connected_peripheral);}} />
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        margin: 10,
    },
    login_button: {
        fontSize: 20,
        color: 'black',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    container2: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 150,
        height: 150,
        margin: 50,
    },
    text: {
        color: 'black',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        marginTop: 20,
        fontSize: 30,
    },
    customFont: {
        fontFamily: 'Friction-Core',
        color: 'black',
        backgroundColor: 'transparent',
        marginTop: 20,
        fontSize: 50,
    },


});

AppRegistry.registerHeadlessTask('BLEAndLocation', () => BLEAndLocation, );
AppRegistry.registerComponent('lifeVectorMobile', () => lifeVectorMobile);
