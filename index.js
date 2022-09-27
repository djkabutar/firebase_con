const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require("./credentials/ssip-fad50-firebase-adminsdk-glqt9-fe1e64e958.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function loadData(ws, rooms, cabin) {
  const snapshot = await db.collection(`rooms/${rooms}/Cabin/${cabin}/Appliances`);
  snapshot.onSnapshot((collection) => {
    var dataString = JSON.stringify(collection.docs.map(doc => doc.data()));
    ws.send(dataString);
  });
}

const websocket = require("ws");

var clients = [];

const wss = new websocket.Server({
  port: 7788,
  clientTracking: true
});

wss.on("connection", (ws) => {
  console.log("a  client  connected to server");
  clients.push(ws);

  ws.on("message", (msg) => {
    console.log(`received message ${msg}`);
    var dataJson = JSON.parse(msg);
    loadData(ws, dataJson["rooms"], dataJson["Cabin"]);
  });

  ws.on("close", () => {
    console.log("client disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});

console.log(new Date() + " server listeniinig on port 7788");
