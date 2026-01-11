import { useEffect, useRef, useState } from "react"
import "./App.css"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [username, setUsername] = useState("")
  const [joined, setJoined] = useState(false)

  const wsRef = useRef(null)

  useEffect(() => {
    if (!joined) return

    const ws = new WebSocket("ws://localhost:8080")
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomId: "room1" }
        })
      )
    }

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data])
    }

    return () => ws.close()
  }, [joined])

  const sendMessage = () => {
    if (!input.trim()) return
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: `${username}: ${input}`
        }
      })
    )

    setInput("")
  }

  /* ---------- JOIN SCREEN ---------- */
  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-[360px] text-center">

          {/* Fancy Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-400 blur-xl opacity-70 animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500
                flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                💬
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-widest text-purple-700">
              CHIT CHAT
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Talk • Connect • Enjoy
            </p>
          </div>

          <input
            className="w-full p-3 rounded-xl border border-gray-300 outline-none mb-4 focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <button
            onClick={() => username && setJoined(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Join Chat
          </button>
        </div>
      </div>
    )
  }

  /* ---------- CHAT SCREEN ---------- */
  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">

      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-500">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white blur-lg opacity-60 animate-pulse"></div>
            <div className="relative w-10 h-10 rounded-full bg-white
              flex items-center justify-center text-xl font-bold shadow">
              💬
            </div>
          </div>
          <h2 className="text-white text-xl font-extrabold tracking-wider">
            CHIT CHAT
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-purple-50">
          {messages.map(msg => {
            const isMe = msg.startsWith(username + ":")
            return (
              <div
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow
                    ${isMe
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                      : "bg-white border text-gray-800"
                    }`}
                >
                  {msg}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-3 items-center bg-gray-100 rounded-xl px-4 py-2">
            <input
              className="flex-1 bg-transparent outline-none text-gray-800"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-xl font-medium hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
