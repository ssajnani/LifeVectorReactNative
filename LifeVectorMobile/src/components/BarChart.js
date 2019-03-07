import React from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    processColor
} from 'react-native';

import {BarChart} from 'react-native-charts-wrapper';



import sample from './../../test.json';

export default class App extends React.Component {

    constructor() {
        super();
        this.state = {
            chartDescription: {
                text: "",
                textSize: 10
            },
            xAksis:{
                drawLabels: false,
                drawGridLines: false
            },
            marker:{
                enabled: true
            },
            legend:{
                enabled: true,
                text: "Legend",
                textSize: 20,
                formSize: 20,
                textColor: processColor('#000000'),
                custom: {
                    colors: [],
                    labels:[]
                },
                wordWrapEnabled: true,
                position: 10

            },
            data: {

                dataSets:[
                    {
                        values: [],
                        label: 'Timespent',
                        config: {
                            colors: []
                        }
                    }
                ]
            }
        };
        var total = 0;
        for(var i = 0; i < sample.results.length; i++) {
            total = total + parseInt(sample.results[i].timespent);
        }for(var i = 0; i < sample.results.length; i++) {
            var frequency = Math.ceil((parseInt(sample.results[i].timespent)/total)*100);
            this.state.data.dataSets[0].values[i] = {'y':frequency};
            this.state.data.dataSets[0].values[i].x = i + 1;
            this.state.data.dataSets[0].values[i].marker = sample.results[i].Name;
            var color = processColor(this.getRandColor(5));
            this.state.legend.custom.colors[i] = color;
            this.state.legend.custom.labels[i] = sample.results[i].Name;
            this.state.data.dataSets[0].config.colors[i] = color;
        }

    }

    getRandColor(brightness){
        // Six levels of brightness from 0 to 5, 0 being the darkest
        var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
        var mix = [brightness*51, brightness*51, brightness*51]; //51 => 255/5
        var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function(x){ return Math.round(x/2.0)})
        return "rgb(" + mixedrgb.join(",") + ")";
    }

    render() {
        return (

            <View style={styles.container}>
                <Text style={styles.text}>Frequency of Time Spent</Text>
                <BarChart
                    style={styles.chart}
                    data={this.state.data}
                    width={"100%"}
                    height={"90%"}
                    legend={this.state.legend}
                    marker={this.state.marker}
                    chartDescription={this.state.chartDescription}
                    xAxis={this.state.xAksis}
                />
            </View>


        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'

    },
    chart: {
        flex: 0
    },
    text: {
        fontSize: 30,
        color: 'grey',
        fontWeight: 'bold',
        marginTop: 20,
        fontSize: 30,
        textAlign: 'center'
    }
});

