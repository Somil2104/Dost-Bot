import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Calendar,
  Drawer,
  Input,
  List,
} from "antd";
import { PlusOutlined, MessageOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

export default function LandingPage() {
  const [chatVisible, setChatVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const response = await axios.post("http://localhost:7000/query/", { query: message });
      setChat((prevChat) => [...prevChat, { user: message, bot: response.data.response }]);
      setMessage("");
    } catch (error) {
      setChat((prevChat) => [...prevChat, { user: message, bot: "Error connecting to the bot 🤖❌" }]);
      setMessage("");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-blue-300 py-10 px-6"
      style={{ paddingLeft: "36px", paddingRight: "36px" }}
    >
      <Space direction="vertical" size="large" className="w-full max-w-4xl">
        {/* Header Section */}
        <div
          className="text-center"
          style={{
            padding: "15px",
            borderRadius: "0px 0px 12px 12px",
            backgroundColor: "#006666",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title level={2} style={{ color: "White" }}>
            Good Morning 🌞
          </Title>
          <Text italic style={{ color: "White", fontSize: "18px", fontWeight: "bold" }}>
            "Every day is a new beginning. Take a deep breath, smile, and start again."
          </Text>
          <Text
            style={{ color: "White", fontSize: "16px", display: "block", marginTop: "10px" }}
          >
            What are your intentions for today?
          </Text>
        </div>

        {/* Calendar & Add Journal Section */}
        <Card style={{ borderRadius: "12px", backgroundColor: "#F8FAFC", padding: "15px" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Calendar fullscreen={false} />
            <Link to={"/journal"}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                style={{
                  backgroundColor: "#4F46E5",
                  borderColor: "#4F46E5",
                  borderRadius: "8px",
                  alignSelf: "center",
                }}
              >
                Add Journal
              </Button>
            </Link>
          </Space>
        </Card>

        {/* Practices Section */}
        <div>
          <Space direction="horizontal" style={{ justifyContent: "space-between", width: "100%" }}>
            <Text strong style={{ fontSize: "20px", color: "#1E293B" }}>
              Practices
            </Text>
            <Text style={{ fontSize: "16px", color: "#64748B" }}>10 mins</Text>
          </Space>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {[
              { icon: "🌅", title: "Morning Meditation", time: "10 minutes" },
              { icon: "🌿", title: "Afternoon Confidence", time: "10 minutes" },
              { icon: "🌙", title: "Evening Blissfulness", time: "10 minutes" },
            ].map((item, index) => (
              <Card
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px",
                  borderRadius: "12px",
                  backgroundColor: "#F3E8FF",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#D8B4FE",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "22px",
                    marginRight: "15px",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <Text strong style={{ fontSize: "18px", color: "#1E293B" }}>
                    {item.title}
                  </Text>
                  <br />
                  <Text style={{ fontSize: "14px", color: "#64748B" }}>
                    {item.time}
                  </Text>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      </Space>

      {/* Floating Chat Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#4F46E5",
        }}
        onClick={() => setChatVisible(true)}
      />

      {/* Chat Drawer */}
      <Drawer
        title="💬 Chat with Sentiment Bot"
        placement="right"
        width={450} // Slightly wider for better visibility
        onClose={() => setChatVisible(false)}
        open={chatVisible}
      >
        <List
          className="mb-4"
          bordered
          dataSource={chat}
          renderItem={(c, index) => (
            <List.Item key={index}>
              <Card className="w-full">
                <p className="text-blue-600 font-semibold">You: {c.user}</p>
                <p className="text-green-600">Bot: {c.bot}</p>
              </Card>
            </List.Item>
          )}
        />

        {/* Input and Send Button */}
        <Input.TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Button type="primary" className="mt-3 w-full" onClick={sendMessage}>
          Send
        </Button>
      </Drawer>
    </div>
  );
}
