import boto3
import json
import time
import os
import pyautogui
import pygetwindow as gw
 
client = boto3.client('iot-data', region_name='eu-west-1')

while True: 
    response = client.get_thing_shadow(thingName='Test')
    streamingBody = response["payload"]
    jsonState = json.loads(streamingBody.read())
    print ("jsonState Update")
    
    try:
        if jsonState["state"]["delta"]["openProgramme"] == "True":
            print ("Value is True")
            filename = r"C:\Users\Joe\Documents\MQTTLabview\mqttFolder\src\IoTShadowExample.vi"
            os.system("start "+filename)
            time.sleep(20)
        else:
            os.system("taskkill /f /im  LabVIEW.exe")
            print ("Value is False")
            jsonPayload ='{ "state":{ "reported":{"openProgramme": "False"}}}'
            print (jsonPayload)
            client.update_thing_shadow(thingName='Test', payload= jsonPayload)
            time.sleep(5)
            
    except:
##        time.sleep(1)
        print ("No Open Delta")

    try:
        if jsonState["state"]["delta"]["stopProgramme"] == "False":
            time.sleep(5)
            print ("Starting programme")
            virtualBenchWindow = gw.getWindowsWithTitle('VirtualBench')[0]
            labviewWindow = gw.getWindowsWithTitle('IoTShadowExample3.vi Front Panel')[0]
            virtualBenchWindow.minimize() 
            pyautogui.click(x=500, y=500)
            pyautogui.hotkey('ctrl', 'r')
            labviewWindow.maximize()
##            update = {"state" : { "reported" : { "stopProgramme" : "False"}}}
##            payload = json.dumps(update)
##            response = client.update_thing_shadow(
##                thingName = 'Test',
##                payload = payload
##                )
    except:
        time.sleep(1)
        print ("No Stop Delta")

