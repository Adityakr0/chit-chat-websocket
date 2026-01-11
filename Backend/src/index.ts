import WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let userCount = 0;
let allSockets: User[] = [];

wss.on("connection", (socket) => {
  userCount++;

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      const currentUserRoom = allSockets.find(
        (x) => x.socket === socket
      )?.room;

      if (!currentUserRoom) return;

      for (let i = 0; i < allSockets.length; i++) {
        const user = allSockets[i]; // 👈 important fix
        if (user && user.room === currentUserRoom) {
          user.socket.send(parsedMessage.payload?.message);
        }
      }
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((u) => u.socket !== socket);
    userCount--;
    console.log("Client disconnected " + userCount);
  });
});
