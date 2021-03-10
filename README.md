# esp32 Rower sensor

## 

    sudo chmod a+rw /dev/ttyUSB0


## RPC

    curl http://192.168.1.130/rpc/Led -d '{"a":1, "b": 2}'

https://mongoose-os.com/docs/mongoose-os/userguide/rpc.md


## SerLCD
https://docs.google.com/document/d/1Jg1R2eXgXl7fwOFfjCIDnrc-6mAETJV2R8NGf-ptP0Q/edit

Control Character
Command
Description
0xFE
0x01
Clear Display
0x14
Move Cursor Right 1 Space
0x10
Move Cursor Left 1 Space
0x1C
Scroll Right 1 Space
0x18
Scroll Left 1 Space
0x0C
Turn Display On / Hide Cursor
0x08
Turn Display Off
0x0E
Underline Cursor On
0x0D
Blinking Cursor On
0x80 + n
Set Cursor Position
0x7C
0x03
20 Characters Wide
0x04
16 Characters Wide
0x05
4 Lines
0x06
2 Lines
0x0A
Set Splash Screen
0x0B
Set Baud Rate to 2400
0x0C
Set Baud Rate to 4800
0x0D
Set Baud Rate to 9600
0x0E
Set Baud Rate to 14400
0x0F
Set Baud Rate to 19200
0x10
Set Baud Rate to 38400
0x80
Backlight Off*
0x9D
Backlight Fully On*
0x12
Reset to 9600 Baud - send during boot-up


