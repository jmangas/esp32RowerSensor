load('api_timer.js');
load('api_uart.js');
load('api_sys.js');
load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_rpc.js');
//load('api_mqtt.js');
//load('api_shadow.js');
//load('api_aws.js');
//load('api_dash.js');

let uartNo = 1;   // Uart number used for this example
let rxAcc = '';   // Accumulated Rx data, will be echoed back to Tx
let value = false;
let btn = Cfg.get('board.btn1.pin');              // Built-in button GPIO
let led = 2;              // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');     // LED on when high?
let state = {on: false, btnCount: 0, uptime: 0};  // Device state
let online = false;                               // Connected to the cloud?

let setLED = function(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);
  print('LED on ->', on);
};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
setLED(state.on);


// Configure UART at 9600 baud
UART.setConfig(uartNo, {
  baudRate: 9600,
  esp32: {
    gpio: {
      rx: 16,
      tx: 17,
    },
  },
});

// Set dispatcher callback, it will be called whenver new Rx data or space in
// the Tx buffer becomes available
UART.setDispatcher(uartNo, function(uartNo) {
  let ra = UART.readAvail(uartNo);
  if (ra > 0) {
    // Received new data: print it immediately to the console, and also
    // accumulate in the "rxAcc" variable which will be echoed back to UART later
    let data = UART.read(uartNo);
    print('Received UART data:', data);
    rxAcc += data;
  }
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);

UART.write( uartNo, "\xFE");
UART.write( uartNo, "\x01"); // Clear display
UART.write( uartNo, "\x14");
UART.write( uartNo, "OK");

// Send UART data every second
// Timer.set(1000 /* milliseconds */, Timer.REPEAT, function() {
//   value = !value;
//   UART.write(
//     uartNo,
//     'Hello UART! '
//       + (value ? 'Tick' : 'Tock')
//       + ' uptime: ' + JSON.stringify(Sys.uptime())
//       + ' RAM: ' + JSON.stringify(Sys.free_ram())
//       + (rxAcc.length > 0 ? (' Rx: ' + rxAcc) : '')
//       + '\n'
//   );
//   rxAcc = '';
// }, null);
// Update state every second, and report to cloud if online
Timer.set(6000, Timer.REPEAT, function() {
  state.uptime = Sys.uptime();
  state.ram_free = Sys.free_ram();
  print('online:', online, JSON.stringify(state));
  if (online) reportState();
}, null);

if (btn >= 0) {
  let btnCount = 0;
  let btnPull, btnEdge;
  if (Cfg.get('board.btn1.pull_up') ? GPIO.PULL_UP : GPIO.PULL_DOWN) {
    btnPull = GPIO.PULL_UP;
    btnEdge = GPIO.INT_EDGE_NEG;
  } else {
    btnPull = GPIO.PULL_DOWN;
    btnEdge = GPIO.INT_EDGE_POS;
  }
  
  GPIO.set_button_handler(btn, btnPull, btnEdge, 20, function() {
    state.btnCount++;
    state.on = !state.on;
    setLED(state.on);

    let message = JSON.stringify(state);
    print(message);
    let sendMQTT = true;
    // if (Dash.isConnected()) {
    //   print('== Click!');
    //   // TODO: Maybe do something else?
    //   sendMQTT = false;
    // }
    // // AWS is handled as plain MQTT since it allows arbitrary topics.
    // if (AWS.isConnected() || (MQTT.isConnected() && sendMQTT)) {
    //   let topic = 'devices/' + Cfg.get('device.id') + '/events';
    //   print('== Publishing to ' + topic + ':', message);
    //   MQTT.pub(topic, message, 0 /* QoS */);
    // } else if (sendMQTT) {
    //   print('== Not connected!');
    // }
  }, null);
}

RPC.addHandler('Led', function(args) {
  if (typeof(args) === 'object' ) {
    state.on = !state.on;
    setLED(state.on);
    return state.on;
  } else {
    return {error: -1, message: 'Bad request. Expected: {"a":N1,"b":N2}'};
  }
});

RPC.addHandler('Sum', function(args) {
  if (typeof(args) === 'object' && typeof(args.a) === 'number' && typeof(args.b) === 'number') {
    return args.a + args.b;
  } else {
    return {error: -1, message: 'Bad request. Expected: {"a":N1,"b":N2}'};
  }
});