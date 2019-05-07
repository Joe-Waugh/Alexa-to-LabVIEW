'use strict';

var mqtt = require('mqtt');

var AWS = require('aws-sdk');

var config = {};

config.IOT_BROKER_ENDPOINT      = "as0nu2tb7tu3r-ats.iot.eu-west-1.amazonaws.com".toLowerCase();

config.IOT_BROKER_REGION        = "eu-west-1";

config.IOT_THING_NAME           = "Test";

AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT

var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: title,
            content: output,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = "Welcome to Alexa for Lab view. How can I help you?";
    const repromptText = "How can I help you?";
    const shouldEndSession = false;
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Alexa for Lab view skill. Have a nice day!';
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function createVoltageAmmount(SVoltage) {
    return {
        Voltage: SVoltage
    };
}

function controlVoltageInSession(intent, session, callback) {
    const cardTitle = intent.name;
    const voltageVariationRequest = intent.slots.variations;
    const voltageChangeVariantRequest = intent.slots.changeVariant;
    const voltageNumberVoltsRequest = intent.slots.numberVolts;
    const voltageVoltsRequest = intent.slots.volts;
    const voltageNumberDecimalVoltsRequest = intent.slots.numberDecimalVolts;
    const voltageChannelRequest = intent.slots.voltageChannel;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (voltageVariationRequest) {
		var voltageVariation = voltageVariationRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
	if (voltageChangeVariantRequest) {
        var voltageChangeVariant = voltageChangeVariantRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    if (voltageNumberVoltsRequest) {
        var voltageNumberVolts = voltageNumberVoltsRequest.value;
    } else {
        console.log("This one 3")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    if (voltageVoltsRequest) {
        var voltageVolts = voltageVoltsRequest.value;
    } else {
        console.log("This one 4")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (voltageNumberDecimalVoltsRequest) {
        var voltageDecimalVolts = voltageNumberDecimalVoltsRequest.value;
    } else {
    }
    if (voltageChannelRequest) {
        var voltageChannel = voltageChannelRequest.value;
    } else {
    }

    console.log("Variation: " + voltageVariation)
    console.log("Change Variant: " + voltageChangeVariant)
    console.log("Number of Volts: " + voltageNumberVolts)
    console.log("Volts / MilliVolts: " + voltageVolts)
    console.log("Decimal Volts: " + voltageDecimalVolts)
    console.log("Channel: " + voltageChannel)

    var payload = {}
    var objState
    var VMultiplier
    var ActualvoltageNumberVolts
    var actualDecimalVolts
    var Ulimit = false
    var Llimit = false
    var params = {
        thingName : "Test"
    };
// Working out voltage order of magnitude
    if (voltageVolts == "kilo volts" || voltageVolts == "kilo volt"){
        VMultiplier = 1000;
    }
    else if (voltageVolts == "Milli volts" || voltageVolts == "Milli volt"){
        VMultiplier = 0.001;
    }
    else {
        VMultiplier = 1;
    }
// Working out decimal numbers
    if (voltageDecimalVolts == undefined){
        actualDecimalVolts = 0
    }
    else {
        voltageDecimalVolts = "0." + voltageDecimalVolts;
        actualDecimalVolts = VMultiplier * voltageDecimalVolts;
        console.log(actualDecimalVolts);
    }
    
    if (voltageChannel == "channel 1" || voltageChannel == 1){
        var channel = "voltageC1"  
    }
    else if(voltageChannel == "channel 2" || voltageChannel == 2){
        var channel = "voltageC2"
    }
    else if(voltageChannel == "channel 3" || voltageChannel == 3){
        var channel = "voltageC3"
    }
    else {
        speechOutput = "Please pick Channel 1, Channel 2 or Channel 3";
        repromptText = "Please pick Channel 1, Channel 2 or Channel 3";
        sessionAttributes = createVoltageAmmount(voltageNumberVolts);
        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
// run code depending on whether it a new number of needs to access previous voltage
    //For when the previous voltage needs to be read
    if  (voltageChangeVariant == "by" || voltageChangeVariant == "up by" || voltageChangeVariant == "down by"){
        iotData.getThingShadow(params, function (err, data) {
            if (err) {
                console.log("Error getting shadow"); // an error occurred
            }
            else {
                // successful response
                payload = data.payload;
                objState = JSON.parse(payload);
                if (voltageChannel == "channel 1" || voltageChannel == 1){
                    var shadow = objState.state.reported.voltageC1
                }
                else if(voltageChannel == "channel 2" || voltageChannel == 2){
                    var shadow = objState.state.reported.voltageC2  
                }
                else if(voltageChannel == "channel 3" || voltageChannel == 3){
                    var shadow = objState.state.reported.voltageC3  
                }
                if (voltageVariation == "increase" || voltageChangeVariant == "up by"){
                    ActualvoltageNumberVolts = voltageNumberVolts * VMultiplier;
                    ActualvoltageNumberVolts = +ActualvoltageNumberVolts + +actualDecimalVolts;
                    var x = +shadow + +ActualvoltageNumberVolts;
                    console.log(x);
                    if (voltageChannel == "channel 1" || voltageChannel == 1){
                        if (x>=6){
                            x=6
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    else if (voltageChannel == "channel 2" || voltageChannel == 2){
                        if (x>=25){
                            x=25
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    else if (voltageChannel == "channel 3" || voltageChannel == 3){
                        if (x>=0){
                            x=0
                            Ulimit = true
                        }
                        else if (x<=-25){
                            x=-25
                            Llimit = true
                        } 
                    }
                    ActualvoltageNumberVolts = x.toString()
                }
                else if (voltageVariation == "decrease" || voltageChangeVariant == "down by"){
                    ActualvoltageNumberVolts = voltageNumberVolts * VMultiplier;
                    ActualvoltageNumberVolts = +ActualvoltageNumberVolts + +actualDecimalVolts;
                    var x = +shadow - +ActualvoltageNumberVolts;
                    console.log(x);
                    if (voltageChannel == "channel 1" || voltageChannel == 1){
                        if (x>=6){
                            x=6
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    else if (voltageChannel == "channel 2" || voltageChannel == 2){
                        if (x>=25){
                            x=25
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    else if (voltageChannel == "channel 3" || voltageChannel == 3){
                        if (x>=0){
                            x=0
                            Ulimit = true
                        }
                        else if (x<=-25){
                            x=-25
                            Llimit = true
                        } 
                    }
                    ActualvoltageNumberVolts = x.toString()                 
                }
                var payloadObj={ "state":
                    { "desired":
                        {
                            [channel]: ActualvoltageNumberVolts
                        }
                    }
                };
                //Prepare the parameters of the update call
                var paramsUpdate = {
                    "thingName" : config.IOT_THING_NAME,
                    "payload" : JSON.stringify(payloadObj)
                };

                //Update Device Shadow
                iotData.updateThingShadow(paramsUpdate, function(err, data) {
                    if (err){
                        console.log ("Error in updating shadow") //Handle the error here
                    }
                    else if (Ulimit === true){
                        speechOutput = "Voltage is now set to the maximum for this channel of " + ActualvoltageNumberVolts + " volts";
                        repromptText = "Voltage is now set to the maximum for this channel of " + ActualvoltageNumberVolts + " volts";
                        sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }
                    else if (Llimit === true){
                        speechOutput = "Voltage is now set to the minimum for this channel of " + ActualvoltageNumberVolts + " volts";
                        repromptText = "Voltage is now set to the minimum for this channel of " + ActualvoltageNumberVolts + " volts";
                        sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }
                    else {
                        speechOutput = "Voltage is now set to " + ActualvoltageNumberVolts + " volts";
                        repromptText = "Voltage is now set to " + ActualvoltageNumberVolts + " volts";
                        sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }    
                }); 
            }    
        });
    }
    // For a new number
    else{
        ActualvoltageNumberVolts = voltageNumberVolts * VMultiplier
        ActualvoltageNumberVolts = +ActualvoltageNumberVolts + +actualDecimalVolts;
        if (voltageChannel == "channel 1" || voltageChannel == 1){
            if (ActualvoltageNumberVolts>=6){
                ActualvoltageNumberVolts=6
                Ulimit = true
            }
            else if (ActualvoltageNumberVolts<=0){
                ActualvoltageNumberVolts=0
                Llimit = true
            } 
        }
        else if (voltageChannel == "channel 2" || voltageChannel == 2){
            if (ActualvoltageNumberVolts>=25){
                ActualvoltageNumberVolts=25
                Ulimit = true
            }
            else if (ActualvoltageNumberVolts<=0){
                ActualvoltageNumberVolts=0
                Llimit = true
            } 
        }
        else if (voltageChannel == "channel 3" || voltageChannel == 3){
            if (ActualvoltageNumberVolts>=0){
                ActualvoltageNumberVolts=0
                Ulimit = true
            }
            else if (ActualvoltageNumberVolts<=-25){
                ActualvoltageNumberVolts=-25
                Llimit = true
            } 
        }
        ActualvoltageNumberVolts = ActualvoltageNumberVolts.toString()
        var payloadObj={ "state":
            { "desired":
                {
                    [channel]: ActualvoltageNumberVolts
                }
            }
        };
        //Prepare the parameters of the update call
        var paramsUpdate = {
            "thingName" : config.IOT_THING_NAME,
            "payload" : JSON.stringify(payloadObj)
        };

        //Update Device Shadow
        iotData.updateThingShadow(paramsUpdate, function(err, data) {
            if (err){
                console.log ("Error in updating shadow") //Handle the error here
            }
            else if (Ulimit === true){
                speechOutput = "Voltage is now set to the maximum for this channel of " + ActualvoltageNumberVolts + " volts";
                repromptText = "Voltage is now set to the maximum for this channel of " + ActualvoltageNumberVolts + " volts";
                sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
            else if (Llimit === true){
                speechOutput = "Voltage is now set to the minimum for this channel of " + ActualvoltageNumberVolts + " volts";
                repromptText = "Voltage is now set to the minimum for this channel of " + ActualvoltageNumberVolts + " volts";
                sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
            else {
                speechOutput = "Voltage is now set to " + ActualvoltageNumberVolts + " volts";
                repromptText = "Voltage is now set to " + ActualvoltageNumberVolts + " volts";
                sessionAttributes = createVoltageAmmount(ActualvoltageNumberVolts);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }    
        });
    }
}

function controlCurrentInSession(intent, session, callback){
    const cardTitle = intent.name;
    const currentVariationRequest = intent.slots.variations;
    const currentChangeVariantRequest = intent.slots.changeVariant;
    const currentNumberAmpsRequest = intent.slots.numberAmps;
    const currentAmpsRequest = intent.slots.amps;
    const currentNumberDecimalAmpsRequest = intent.slots.numberDecimalAmps;
    const currentChannelRequest = intent.slots.currentChannel;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (currentVariationRequest) {
		var currentVariation = currentVariationRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
	if (currentChangeVariantRequest) {
        var currentChangeVariant = currentChangeVariantRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    if (currentNumberAmpsRequest) {
        var currentNumberAmps = currentNumberAmpsRequest.value;
    } else {
        console.log("This one 3")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    if (currentAmpsRequest) {
        var currentAmps = currentAmpsRequest.value;
    } else {
        console.log("This one 4")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (currentNumberDecimalAmpsRequest) {
        var currentDecimalAmps = currentNumberDecimalAmpsRequest.value;
    } else {
    }
    if (currentChannelRequest) {
        var currentChannel = currentChannelRequest.value;
    } else {
    } 
    
    var payload = {}
    var objState
    var CMultiplier
    var ActualcurrentNumberAmps
    var actualDecimalAmps
    var Ulimit = false
    var Llimit = false
    var params = {
        thingName : "Test"
    };
// Working out current order of magnitude
    if (currentAmps == "Milli amps" || currentAmps == "Milli amp"){
        CMultiplier = 0.001;
    }
    else {
        CMultiplier = 1;
    }
// Working out decimal numbers
    if (currentDecimalAmps == undefined){
        actualDecimalAmps = 0
    }
    else {
        currentDecimalAmps = "0." + currentDecimalAmps;
        actualDecimalAmps = CMultiplier * currentDecimalAmps;
        console.log(actualDecimalAmps);
    }
    
    if (currentChannel == "channel 1" || currentChannel == 1){
        var channel = "currentC1"  
    }
    else if(currentChannel == "channel 2" || currentChannel == 2){
        var channel = "currentC2"
    }
    else if(currentChannel == "channel 3" || currentChannel == 3){
        var channel = "currentC3"
    }
    else {
        console.log("Current Channel: " +currentChannel)
        speechOutput = "Please pick Channel 1, Channel 2 or Channel 3";
        repromptText = "Please pick Channel 1, Channel 2 or Channel 3";
        sessionAttributes = createVoltageAmmount(currentNumberAmps);
        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
// run code depending on whether it a new number of needs to access previous current
    //For when the previous current needs to be read
    if  (currentChangeVariant == "by" || currentChangeVariant == "up by" || currentChangeVariant == "down by"){
        iotData.getThingShadow(params, function (err, data) {
            if (err) {
                console.log("Error getting shadow"); // an error occurred
            }
            else {
                // successful response
                payload = data.payload;
                objState = JSON.parse(payload);
                if (currentChannel == "channel 1" || currentChannel == 1){
                    var shadow = objState.state.reported.currentC1
                }
                else if(currentChannel == "channel 2" || currentChannel == 2){
                    var shadow = objState.state.reported.currentC2  
                }
                else if(currentChannel == "channel 3" || currentChannel == 3){
                    var shadow = objState.state.reported.currentC3  
                }
                if (currentVariation == "increase" || currentChangeVariant == "up by"){
                    ActualcurrentNumberAmps = currentNumberAmps * CMultiplier;
                    ActualcurrentNumberAmps = +ActualcurrentNumberAmps + +actualDecimalAmps;
                    var x = +shadow + +ActualcurrentNumberAmps;
                    console.log(x);
                    if (currentChannel == "channel 1" || currentChannel == 1){
                        if (x>=1){
                            x=1
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    else if (currentChannel == "channel 2" || currentChannel == 2 || currentChannel == "channel 3" || currentChannel == 3){
                        if (x>=0.5){
                            x=0.5
                            Ulimit = true
                        }
                        else if (x<=0){
                            x=0
                            Llimit = true
                        } 
                    }
                    ActualcurrentNumberAmps = x.toString()
                }
                else if (currentVariation == "decrease" || currentChangeVariant == "down by"){
                    ActualcurrentNumberAmps = currentNumberAmps * CMultiplier;
                    ActualcurrentNumberAmps = +ActualcurrentNumberAmps + +actualDecimalAmps;
                    var x = +shadow - +ActualcurrentNumberAmps;
                    console.log(x);
                    if (currentChannel == "channel 1" || currentChannel == 1){
                        if (x>=1){
                            x=1
                            Ulimit = true
                        }
                        else if (x<=0.01){
                            x=0.01
                            Llimit = true
                        } 
                    }
                    else if (currentChannel == "channel 2" || currentChannel == 2 || currentChannel == "channel 3" || currentChannel == 3){
                        if (x>=0.5){
                            x=0.5
                            Ulimit = true
                        }
                        else if (x<=0.005){
                            x=0.005
                            Llimit = true
                        } 
                    }
                    ActualcurrentNumberAmps = x.toString()                 
                }
                var payloadObj={ "state":
                    { "desired":
                        {
                            [channel]: ActualcurrentNumberAmps
                        }
                    }
                };
                //Prepare the parameters of the update call
                var paramsUpdate = {
                    "thingName" : config.IOT_THING_NAME,
                    "payload" : JSON.stringify(payloadObj)
                };

                //Update Device Shadow
                iotData.updateThingShadow(paramsUpdate, function(err, data) {
                    if (err){
                        console.log ("Error in updating shadow") //Handle the error here
                    }
                    else if (Ulimit === true){
                        speechOutput = "Current is now set to the maximum for this channel of " + ActualcurrentNumberAmps + " amps";
                        repromptText = "Current is now set to the maximum for this channel of " + ActualcurrentNumberAmps + " amps";
                        sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }
                    else if (Llimit === true){
                        speechOutput = "Current is now set to the minimum for this channel of " + ActualcurrentNumberAmps + " amps";
                        repromptText = "Current is now set to the minimum for this channel of " + ActualcurrentNumberAmps + " amps";
                        sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }
                    else {
                        speechOutput = "Current is now set to " + ActualcurrentNumberAmps + " amps";
                        repromptText = "Current is now set to " + ActualcurrentNumberAmps + " amps";
                        sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                    }    
                }); 
            }    
        });
    }
    // For a new number
    else{
        ActualcurrentNumberAmps = currentNumberAmps * CMultiplier;
        ActualcurrentNumberAmps = +ActualcurrentNumberAmps + +actualDecimalAmps;
        if (currentChannel == "channel 1" || currentChannel == 1){
            if (ActualcurrentNumberAmps>=1){
                ActualcurrentNumberAmps=1
                Ulimit = true
            }
            else if (ActualcurrentNumberAmps<=0.01){
                ActualcurrentNumberAmps=0.01
                Llimit = true
            } 
        }
        else if (currentChannel == "channel 2" || currentChannel == 2 || currentChannel == "channel 3" || currentChannel == 3){
            if (ActualcurrentNumberAmps>=0.5){
                ActualcurrentNumberAmps=0.5
                Ulimit = true
            }
            else if (ActualcurrentNumberAmps<=0.005){
                ActualcurrentNumberAmps=0.005
                Llimit = true
            } 
        }
        ActualcurrentNumberAmps = ActualcurrentNumberAmps.toString()
        var payloadObj={ "state":
            { "desired":
                {
                    [channel]: ActualcurrentNumberAmps
                }
            }
        };
        //Prepare the parameters of the update call
        var paramsUpdate = {
            "thingName" : config.IOT_THING_NAME,
            "payload" : JSON.stringify(payloadObj)
        };

        //Update Device Shadow
        iotData.updateThingShadow(paramsUpdate, function(err, data) {
            if (err){
                console.log ("Error in updating shadow") //Handle the error here
            }
            else if (Ulimit === true){
                speechOutput = "Current is now set to the maximum for this channel of " + ActualcurrentNumberAmps + " amps";
                repromptText = "Current is now set to the maximum for this channel of " + ActualcurrentNumberAmps + " amps";
                sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
            else if (Llimit === true){
                speechOutput = "Current is now set to the minimum for this channel of " + ActualcurrentNumberAmps + " amps";
                repromptText = "Current is now set to the minimum for this channel of " + ActualcurrentNumberAmps + " amps";
                sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
            else {
                speechOutput = "Current is now set to " + ActualcurrentNumberAmps + " amps";
                repromptText = "Current is now set to " + ActualcurrentNumberAmps + " amps";
                sessionAttributes = createVoltageAmmount(ActualcurrentNumberAmps);
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }    
        });
    }
}

function resetInSession(intent, session, callback){
    const cardTitle = intent.name;
    const instrumentRequest = intent.slots.instrument;
    const channelRequest = intent.slots.channel;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (instrumentRequest) {
		var instrument = instrumentRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
	if (channelRequest) {
        var channel = channelRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (channel == "channel 1" || channel == 1){
        var cChannel = "currentC1"
        var vChannel = "voltageC1" 
        var toAlexa = "Channel 1" 
        var cReset = "0.01"
    } else if(channel == "channel 2" || channel == 2){
        var cChannel = "currentC2"
        var vChannel = "voltageC2"  
        var toAlexa = "Channel 2" 
        var cReset = "0.005"
    } else if(channel == "channel 3" || channel == 3){
        var cChannel = "currentC3"
        var vChannel = "voltageC3"  
        var toAlexa = "Channel 3" 
        var cReset = "0.005"
    }
    var cPayloadObj={ "state":
        { "desired":
            {
                [cChannel]: cReset
            }
        }
    };
    var vPayloadObj={ "state":
        { "desired":
            {
                [vChannel]: "0"
            }
        }
    };
    //Prepare the parameters of the update call
    var cParamsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(cPayloadObj)
    };
    var vParamsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(vPayloadObj)
    };

    //Update Device Shadow
    iotData.updateThingShadow(cParamsUpdate, function(err, data) {
        if (err){
            console.log ("Error in updating shadow") //Handle the error here
        } else {
        }    
    }); 
    iotData.updateThingShadow(vParamsUpdate, function(err, data) {
        if (err){
            console.log ("Error in updating shadow") //Handle the error here
        } else {
            speechOutput = toAlexa + " has been reset";
            repromptText = toAlexa + " has been reset";
            sessionAttributes = createVoltageAmmount("0");
            callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }    
    }); 
}

function dmmInSession(intent, session, callback) {
    const cardTitle = intent.name;
    const dmmFunctionRequest = intent.slots.dmmFunction;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (dmmFunctionRequest) {
        var dmmFunction = dmmFunctionRequest.value;
        var dmmFunction2 = ""
        dmmFunction = dmmFunction.toLowerCase()
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }

    if (dmmFunction == "dc voltage"){
        dmmFunction = "DC Volts"
        dmmFunction2 = "D C Volts"
    } else if(dmmFunction == "ac voltage"){
        dmmFunction = "AC Volts"
        dmmFunction2 = "A C Volts"
    }else if(dmmFunction == "dc current"){
        dmmFunction = "DC Current"
        dmmFunction2 = "D C Current"
    }else if(dmmFunction == "ac current"){
        dmmFunction = "AC Current"
        dmmFunction2 = "A C Current"
    }else if(dmmFunction == "resistance"){
        dmmFunction = "Resistance"
        dmmFunction2 = "Resistance"
    }else if(dmmFunction == "diode"){
        dmmFunction = "Diode"
        dmmFunction2 = "Diode"
    }else if(dmmFunction == "continuity"){
        dmmFunction = "Continuity"
        dmmFunction2 = "Continuity"
    }
    
console.log(dmmFunction)

    var payloadObj={ "state":
        { "desired":
            {
                "dmmFunction": dmmFunction
            }
        }
    };

    var paramsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
    };

    iotData.updateThingShadow(paramsUpdate, function(err, data) {
        if (err){
            console.log ("Error in updating shadow") //Handle the error here
        } else {
            speechOutput = "Now measuring " + dmmFunction2;
            repromptText = "Now measuring " + dmmFunction2;
            sessionAttributes = createVoltageAmmount("0");
            callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }    
    }); 
}

function openProgrammeInSession(intent, session, callback){
    const cardTitle = intent.name;
    const openProgrammeRequest = intent.slots.programme;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (openProgrammeRequest) {
		var instrument = openProgrammeRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    
    if (instrument == "labview" || instrument == "lab view"){
        var PayloadObj={ "state":
            { "desired":
                {
                    "openProgramme": "True"
                }
            }
        };

        //Prepare the parameters of the update call
        var ParamsUpdate = {
            "thingName" : config.IOT_THING_NAME,
            "payload" : JSON.stringify(PayloadObj)
        };

        //Update Device Shadow
        iotData.updateThingShadow(ParamsUpdate, function(err, data) {
            if (err){
                console.log ("Error in updating shadow") //Handle the error here
            } else {
                speechOutput = "Opening Lab VIEW";
                repromptText = "Opening Lab VIEW";
                sessionAttributes = createVoltageAmmount("0");
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }    
        }); 
    }else{
        speechOutput = "Sorry, I can't open that programme";
        repromptText = "Sorry, I can't open that programme";
        sessionAttributes = createVoltageAmmount("0");
        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

function closeProgrammeInSession(intent, session, callback){
    const cardTitle = intent.name;
    const closeProgrammeRequest = intent.slots.programme;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (closeProgrammeRequest) {
		var instrument = closeProgrammeRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    
    if (instrument == "labview" || instrument == "lab view"){
        var PayloadObj={ "state":
            { "desired":
                {
                    "openProgramme": "False"
                }
            }
        };

        //Prepare the parameters of the update call
        var ParamsUpdate = {
            "thingName" : config.IOT_THING_NAME,
            "payload" : JSON.stringify(PayloadObj)
        };

        //Update Device Shadow
        iotData.updateThingShadow(ParamsUpdate, function(err, data) {
            if (err){
                console.log ("Error in updating shadow") //Handle the error here
            } else {
                speechOutput = "Closing Lab VIEW";
                repromptText = "Closing Lab VIEW";
                sessionAttributes = createVoltageAmmount("0");
                callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }    
        }); 
    }else{
        speechOutput = "Sorry, I can't close that programme";
        repromptText = "Sorry, I can't close that programme";
        sessionAttributes = createVoltageAmmount("0");
        callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

function stopProgrammeInSession(intent, session, callback){
    const cardTitle = intent.name;
    const stopProgrammeRequest = intent.slots.programme;
    const actionRequest = intent.slots.action;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (stopProgrammeRequest) {
		var instrument = stopProgrammeRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (actionRequest) {
        var action = actionRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}
    
    if (instrument == "labview" || instrument == "lab view"){
        if  (action == "run"){
            var PayloadObj={ "state":
            { "desired":
                {
                    "stopProgramme": "False"
                }
            }
            };

            //Prepare the parameters of the update call
            var ParamsUpdate = {
                "thingName" : config.IOT_THING_NAME,
                "payload" : JSON.stringify(PayloadObj)
            };

            //Update Device Shadow
            iotData.updateThingShadow(ParamsUpdate, function(err, data) {
                if (err){
                    console.log ("Error in updating shadow") //Handle the error here
                } else {
                    console.log(action)
                    console.log(instrument)
                    speechOutput = "Now running Lab VIEW";
                    repromptText = "Now running Lab VIEW";
                    sessionAttributes = createVoltageAmmount("0");
                    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                }    
            });
        }else{
            var PayloadObj={ "state":
            { "desired":
                {
                    "stopProgramme": "True"
                }
            }
            };

            //Prepare the parameters of the update call
            var ParamsUpdate = {
                "thingName" : config.IOT_THING_NAME,
                "payload" : JSON.stringify(PayloadObj)
            };

            //Update Device Shadow
            iotData.updateThingShadow(ParamsUpdate, function(err, data) {
                if (err){
                    console.log ("Error in updating shadow") //Handle the error here
                } else {
                    console.log(action)
                    console.log(instrument)
                    speechOutput = "Now stopping Lab VIEW";
                    repromptText = "Now stopping Lab VIEW";
                    sessionAttributes = createVoltageAmmount("0");
                    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                }    
            });
        } 
    }else{
            console.log(action)
            console.log(instrument)
            speechOutput = "Sorry, I can't control that programme";
            repromptText = "Sorry, I can't control that programme";
            sessionAttributes = createVoltageAmmount("0");
            callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }
}
function dioInSession(intent, session, callback){
    const cardTitle = intent.name;
    const variationsRequest = intent.slots.variations;
    const pinNumberRequest = intent.slots.pinNumber;
    const DIOactionRequest = intent.slots.DIOaction;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (variationsRequest) {
		var variations = variationsRequest.value;
	} else {
        console.log("This one 1")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (pinNumberRequest) {
        var pinNumber = pinNumberRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (DIOactionRequest) {
        var DIOaction = DIOactionRequest.value;
    } else {
        console.log("This one 2")
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    var pin = ("pinC" + pinNumber)
    if (DIOaction == "output" || DIOaction == "low"){
        var DIOaction2 = "Low"
    }else if(DIOaction == "input"){
        var DIOaction2 = "Input"
    }else if(DIOaction == "high"){
        var DIOaction2 = "High"
    }
    var payloadObj={ "state":
        { "desired":
            {
                [pin]: DIOaction2
            }
        }
    };

    var paramsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
    };

    iotData.updateThingShadow(paramsUpdate, function(err, data) {
        if (err){
            console.log ("Error in updating shadow") //Handle the error here
        } else {
            speechOutput = "Pin " + pinNumber + " is now set to " + DIOaction;
            repromptText = "Pin " + pinNumber + " is now set to " + DIOaction;
            sessionAttributes = createVoltageAmmount("0");
            callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }    
    }); 
}
/* function dmmRangeInSession(intent, session, callback) {
    const cardTitle = intent.name;
    const dmmFunctionRequest = intent.slots.dmmFunction;
    const dmmRangeRequest = intent.slots.range;
    const dmmRangeDecimalRequest = intent.slots.rangeDecimal;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';

    if (dmmFunctionRequest) {
        var dmmFunction = dmmFunctionRequest.value;
        dmmFunction = dmmFunction.toLowerCase()
	} else {
    }
    if (dmmRangeRequest) {
        var dmmRange = dmmRangeRequest.value;
	} else {
		speechOutput = "Please try again";
		repromptText = "Please try again";
		callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    if (dmmRangeDecimalRequest) {
        var dmmRangeDeciaml = dmmRangeDecimalRequest.value;
	} else {
    }

    if (dmmFunction != "undefined"){
        if (dmmFunction == "dc voltage"){
            dmmFunction = "DC Volts"
        } else if(dmmFunction == "ac voltage"){
            dmmFunction = "AC Volts"
        }else if(dmmFunction == "dc current"){
            dmmFunction = "DC Current"
        }else if(dmmFunction == "ac current"){
            dmmFunction = "AC Current"
        }else if(dmmFunction == "resistance"){
            dmmFunction = "Resistance"
        }else if(dmmFunction == "diode"){
            dmmFunction = "Diode"
        }
    } else {
        iotData.getThingShadow(params, function (err, data) {
            if (err) {
                console.log("Error getting shadow"); // an error occurred
            }
            else {
                // successful response
                payload = data.payload;
                objState = JSON.parse(payload);
                var shadow = objState.state.reported.voltageC1
            }
        }
    }
    
    console.log(dmmFunction)

    var payloadObj={ "state":
        { "desired":
            {
                "dmmFunction": dmmFunction
            }
        }
    };

    var paramsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
    };

    iotData.updateThingShadow(paramsUpdate, function(err, data) {
        if (err){
            console.log ("Error in updating shadow") //Handle the error here
        } else {
            speechOutput = "Now measuring " + dmmFunction;
            repromptText = "Now measuring " + dmmFunction;
            sessionAttributes = createVoltageAmmount("0");
            callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }    
    }); 
} */
// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}");
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}");

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}");

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'ChangeVoltage') {
        controlVoltageInSession(intent, session, callback);
    }else if (intentName === 'ChangeCurrent') {
        controlCurrentInSession(intent, session, callback);
    }else if (intentName === 'Reset') {
        resetInSession(intent, session, callback);
    }else if (intentName === 'DigitalMultiMeter') {
        dmmInSession(intent, session, callback);
    }else if (intentName === 'ManualRangeDMM') {
        dmmRangeInSession(intent, session, callback);
    }else if (intentName === 'OpenProgramme') {
        openProgrammeInSession(intent, session, callback);
    }else if (intentName === 'CloseProgramme') {
        closeProgrammeInSession(intent, session, callback);
    }else if (intentName === 'StopProgramme') {
        stopProgrammeInSession(intent, session, callback);
    }else if (intentName === 'DigitalIO') {
        dioInSession(intent, session, callback);
    }else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    }else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    }else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}");
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context) => {
    try {
        console.log("event.session.application.applicationId=${event.session.application.applicationId}");

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
					context.succeed(buildResponse(sessionAttributes, speechletResponse));
				});
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
					context.succeed(buildResponse(sessionAttributes, speechletResponse));
				});
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};
