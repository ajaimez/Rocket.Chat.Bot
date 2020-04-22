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
  //   const msgloop = await driver.reactToMessages(processMessages);
  //   console.log("connected and waiting for messages");

  // when a message is created in one of the ROOMS, we
  // receive it in the processMesssages callback

  // greets from the first room in ROOMS
  //   const sent = await driver.sendToRoom(BOTNAME + " is listening ...", ROOMS[0]);
  //   console.log("Greeting message sent");

  await driver.respondToMessages(
    (err, msg, msgOpts) => {
      if (err) throw err;
      console.log("[respond]", JSON.stringify(msg), JSON.stringify(msgOpts));
      demo(msg).catch(e => console.error(e));
    },
    {
      rooms: ["general"],
      allPublic: false,
      dm: true,
      edited: true,
      livechat: false
    }
  );
};

// Demo bot-style interactions
// A: Listen for "tell everyone <something>" and send that something to everyone
// B: Listen for "who's online" and tell that person who's online
async function demo (message: IMessage) {
    console.log(message)
    if (!message.msg) return
    if (/tell everyone/i.test(message.msg)) {
      const match = message.msg.match(/tell everyone (.*)/i)
      if (!match || !match[1]) return
      const sayWhat = `@${message.u!.username} says "${match[1]}"`
      const usernames = await api.users.allNames()
      for (let username of usernames) {
        if (username !== botUser.username) {
          const toWhere = await driver.getDirectMessageRoomId(username)
          await driver.sendToRoomId(sayWhat, toWhere) // DM ID hax
          await delay(200) // delay to prevent rate-limit error
        }
      }
    } else if (/who\'?s online/i.test(message.msg)) {
      const names = await api.users.onlineNames()
      const niceNames = names.join(', ').replace(/, ([^,]*)$/, ' and $1')
      await driver.sendToRoomId(niceNames + ' are online', message.rid!)
    }
  }

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
