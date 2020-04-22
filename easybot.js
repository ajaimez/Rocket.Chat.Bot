const { driver } = require("@rocket.chat/sdk");
// customize the following with your server and BOT account information
// const HOST = "161.35.106.150:3000";
const HOST = "localhost:3000";
const USER = "botkit";
const PASS = "botkit";
const BOTNAME = "botkit"; // name  bot response to
const SSL = false; // server uses https ?
const ROOMS = ["GENERAL"];

var myuserid;
// this simple bot does not handle errors, different message types, server resets
// and other production situations

const runbot = async () => {
  const conn = await driver.connect({ host: HOST, useSsl: SSL });
  myuserid = await driver.login({ username: USER, password: PASS });
  const roomsJoined = await driver.joinRooms(ROOMS);
  console.log("joined rooms");

  // set up subscriptions - rooms we are interested in listening to
  const subscribed = await driver.subscribeToMessages();
  console.log("subscribed");

  // connect the processMessages callback
  const msgloop = await driver.reactToMessages(processMessages);
  console.log("connected and waiting for messages");

  // when a message is created in one of the ROOMS, we
  // receive it in the processMesssages callback

  // greets from the first room in ROOMS
  const sent = await driver.sendToRoom(BOTNAME + " is listening ...", ROOMS[0]);
  console.log("Greeting message sent");
};

// callback for incoming messages filter and processing
const processMessages = async (err, message, messageOptions) => {
  if (!err) {
    console.log(message.u._id);
    // filter our own message
    if (message.u._id === myuserid) return;
    // can filter further based on message.rid
    const roomname = await driver.getRoomName(message.rid);
    if (message.msg.toLowerCase().indexOf(BOTNAME) >= 0) {
      const response =
        message.u.username +
        ", Hola soy " +
        BOTNAME +
        " mensaje recibido: " +
        message.msg.substr(BOTNAME.length + 1);
      const sentmsg = await driver.sendToRoom(response, roomname);
    }
  }
};

runbot();
