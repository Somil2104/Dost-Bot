import { useState } from "react";
import { Input, Button, List, Card } from "antd";
import axios from "axios";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;
    const response = await axios.post("http://localhost:7000/query/", { query: message });
    setChat([...chat, { user: message, bot: response.data.response }]);
    setMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">💬 Chat with Sentiment Bot</h2>
      <List
        className="mb-4"
        bordered
        dataSource={chat}
        renderItem={(c) => (
          <List.Item>
            <Card className="w-full">
              <p className="text-blue-600 font-semibold">You: {c.user}</p>
              <p className="text-green-600">Bot: {c.bot}</p>
            </Card>
          </List.Item>
        )}
      />
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <Button type="primary" className="mt-3" onClick={sendMessage}>
        Send
      </Button>
    </div>
  );
}
