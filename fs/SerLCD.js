load('api_uart.js');

let SerLCD = {
    uartNo: 1,
    lcdUART: null,
    init: function(args){
        //if(lcdUART === undefined){
            // Configure UART at 9600 baud

            print( this.uartNo);
            print( this.lcdUART);
            UART.setConfig(this.uartNo, {
                baudRate: 9600,
                esp32: {
                gpio: {
                    rx: 16,
                    tx: 17,
                },
                },
            });
            // Enable Rx
            UART.setRxEnabled(this.uartNo, true);
            this.lcdUART = UART;
        //}
        this.clearDisplay();
    },
    writeUART: function(args){
        this.lcdUART.write( this.uartNo, args);
    },
    clearDisplay: function(){
        this.writeUART(  "\xFE");
        this.writeUART(  "\x01"); // Clear display
    },
    write: function(args){
        this.writeUART(args);
    },
    moveCurosr1PosRight: function(){
        this.writeUART(  "\xFE");
        this.writeUART(  "\x14");
    }

}