import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Input,
  Drawer,
  Space,
  List,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function JournalPage() {
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);

  useEffect(() => {
    axios.get("https://dost-bot-production.up.railway.app/get_journals/").then((res) => {
      setPastEntries(res.data.journals);
    });
  }, []);

  const handleSave = async () => {
    console.log("Saved Journal Entry:", journalEntry);
    if (!journalEntry) return;
    await axios.post("https://dost-bot-production.up.railway.app/add_entry/", {
      text: journalEntry,
    });
    var emotion;
    await axios
      .get("https://dost-bot-production.up.railway.app/get_emotions/", {
        params: { query: journalEntry },
      })
      .then((response) => {
        emotion = response.data.mood;
      });
    setPastEntries([
      { text: journalEntry, sentiment: getSentiment(emotion) },
      ...pastEntries,
    ]);
  };

  const getSentiment = (text) => {
    console.log(text);
    if (text === "POSITIVE") return "😃";
    if (text === "NEUTRAL") return "😐";
    if (text === "NEGATIVE") return "😞";
    else return text;
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-blue-300 py-10 px-6"
      style={{
        padding: "36px",
      }}
    >
      <Space direction="vertical" size="large" className="w-full max-w-8xl">
        {/* Journal Card */}
        <Card
          style={{
            width: "1200px",
            height: "100%",
            padding: "20px",
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {/* Back Button */}

          <Space
            direction="horizontol"
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              type="text"
              onClick={() => navigate("/")}
              style={{ color: "#1E293B", fontSize: "10px" }}
            >
              Back
            </Button>
            <Title level={3} style={{ color: "#1E293B", textAlign: "center" }}>
              📖 Journal Entry
            </Title>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                fontSize: "16px",
                backgroundColor: "#f59e0b",
                color: "white",
                borderRadius: "8px",
              }}
            >
              View Past Entries
            </Button>
          </Space>

          {/* Date */}
          <Text
            strong
            style={{
              display: "block",
              fontSize: "16px",
              color: "#64748B",
              marginBottom: "10px",
            }}
          >
            {dayjs().format("MMMM D, YYYY")}
          </Text>

          {/* Text Area */}
          <TextArea
            rows={6}
            placeholder="Write your thoughts here..."
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            style={{ borderRadius: "8px" }}
          />

          {/* Buttons */}
          <Space
            style={{
              marginTop: "20px",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={() => navigate("/")}
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              style={{
                backgroundColor: "#4F46E5",
                borderColor: "#4F46E5",
                borderRadius: "8px",
              }}
            >
              Save
            </Button>
          </Space>
        </Card>
      </Space>
      <Drawer
        title="📜 Past Journal Entries"
        placement="right"
        width={750}
        onClose={() => setDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <List
          className="mt-3"
          bordered
          dataSource={pastEntries}
          renderItem={(entry) => (
            <List.Item>
              <Card className="w-full">
                <p>{entry.text}</p>
                <Tag>{getSentiment(entry.sentiment)}</Tag>
              </Card>
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}
