this.manager.startDeviceScan(null, {'allowDuplicates': false}, (error, device) => {
    if (error) {
        return
    }
    // Check if it is a device you are looking for based on advertisement data
    // or other criteria.
    if (device != null && device.name != null && device.name.startsWith('lifepi')) {
        // Stop scanning as it's not necessary if you are scanning for one device.
        device.connect()
            .then((dev_id) => {
                this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
                    .then((data) => {
                        console.log(data);
                        this.setTimeout(() => {
                            this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
                                .then((data) => {
                                    console.log(data);
                                    this.setTimeout(() => {
                                        this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
                                            .then((data) => {
                                                console.log(data);
                                                this.setTimeout(() => {
                                                    this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
                                                        .then((data) => {
                                                            console.log(data);
                                                            this.setTimeout(() => {
                                                                this.manager.writeCharacteristicWithResponseForService("00000001-1E3C-FAD4-74E2-97A033F1BFAA", "00000003-1E3C-FAD4-74E2-97A033F1BFAA", btoa("hellllly you"))
                                                                    .then((data) => {
                                                                        console.log(data);
                                                                        this.setTimeout(() => {

                                                                        }, 5000)
                                                                    }).catch((error4) => {
                                                                    console.log(error4);
                                                                })
                                                            }, 5000)
                                                        }).catch((error3) => {
                                                        console.log(error3);
                                                    })
                                                }, 5000)
                                            }).catch((error2) => {
                                            console.log(error2);
                                        })
                                    }, 5000)
                                }).catch((error1) => {
                                console.log(error1);
                            })
                        }, 5000)
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            })
            .catch((error) => {
                console.log(error);
                s
            });
    }
});
