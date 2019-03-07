import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, KeyboardAvoidingView, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import Button from 'react-native-button';
import UserInput from './UserInput';

import logoImg from '../images/logo.png';

export default class LoginPage extends Component {

    render() {
        return (
            <View style={styles.container}>
                <Image source={logoImg} style={styles.image} />
              <Text style={styles.customFont}>Life Vector</Text>
                <KeyboardAvoidingView behavior="padding" style={styles.textContainer}>
                    <UserInput
                        source=""
                        placeholder="Username"
                        autoCapitalize={'none'}
                        returnKeyType={'done'}
                        autoCorrect={false}
                    />
                    <UserInput
                        source=""
                        placeholder="Password"
                        returnKeyType={'done'}
                        autoCapitalize={'none'}
                        autoCorrect={false}
                    />
                </KeyboardAvoidingView>
                <Button
                    style={{fontSize: 20, color: 'black'}}
                    containerStyle={{ top: -100, padding: 10,width: 365, height: 45, overflow: 'hidden', borderRadius: 4, backgroundColor: 'lightgray' }}
                    onPress={this._handlePress}>
                    Login
                </Button>
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
      paddingBottom: '3%'
    },
      textContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: '5%'
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
        width: 190,
        height: 190,
        margin: '5%',
        marginTop: '25%'
    },
    text: {
        color: 'black',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        marginTop: '10%',
        fontSize: 30,
    },
    customFont: {
        fontFamily: "Hatterline-Regular",
        color: 'black',
        backgroundColor: 'transparent',
        marginTop: '3%',
        fontSize: 80,
    },


});
