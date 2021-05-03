load('api_timer.js');
load('api_uart.js');
load('api_sys.js');
load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_rpc.js');
load('SerLCD.js');
//load('api_mqtt.js');
//load('api_shadow.js');
//load('api_aws.js');
//load('api_dash.js');

//let uartNo = 1;   // Uart number used for this example
let rxAcc = '';   // Accumulated Rx data, will be echoed back to Tx
let value = false;
let btn = Cfg.get('board.btn1.pin');              // Built-in button GPIO
let led = 2;              // Built-in LED GPIO number
let sensorPin = 23;
let onhi = Cfg.get('board.led1.active_high');     // LED on when high?
let state = {on: false, btnCount: 0, uptime: 0};  // Device state
let data = {clicksFromStart: 0, clicksSecond: 0, clicksSinceLastCall: 0};  // Sensar data
let online = false;                               // Connected to the cloud?
let modeDebug = true;

let setLED = function(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);
  print('LED on ->', on);
};

GPIO.set_mode(sensorPin, GPIO.MODE_INPUT);  // Sensor
GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // Board Led
setLED(state.on);

SerLCD.init();
SerLCD.clearDisplay();
SerLCD.write("hola");

GPIO.set_button_handler(sensorPin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 20, function() {
  data.clicksFromStart++;
  data.clicksSecond++;
  data.clicksSinceLastCall++;  
  if(modeDebug){
    state.on = !state.on;
    setLED(state.on);
    let message = JSON.stringify(data);
    print(message);
  } 
}, null);


Timer.set(1000, Timer.REPEAT, function() {
  data.clicksSecond = 0;
}, null);


Timer.set(20000, Timer.REPEAT, function() {
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

RPC.addHandler('ClicksSinceLastCall', function(args) {
  let clicksSinceLastCall = data.clicksSinceLastCall;
  data.clicksSinceLastCall =  0;
  return clicksSinceLastCall;  
});

RPC.addHandler('ClicksFromStart', function(args) {
  return data.clicksFromStart;  
});
RPC.addHandler('ClicksLastSecond', function(args) {
  return data.clicksSecond;  
});