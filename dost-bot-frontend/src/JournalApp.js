import { useState } from "react";
import { Card } from "antd";
import { Button, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";

export default function JournalApp() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const addEntry = async () => {
    if (!newEntry.trim()) return;
    await axios.post("http://localhost:7000/add_entry/", { text: newEntry });
    setEntries([...entries, newEntry]);
    setNewEntry("");
  };

  const queryJournal = async () => {
    if (!query.trim()) return;
    const res = await axios.post("http://localhost:7000/query/", { query });
    setResponse(res.data.response);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Journal AI</h1>
      
      <Card style={{ marginBottom: "20px" }}>
        <TextArea
          placeholder="Write your journal entry..."
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          rows={4}
        />
        <Button type="primary" block onClick={addEntry} style={{ marginTop: "10px" }}>
          Save Entry
        </Button>
      </Card>
      
      <Card style={{ marginBottom: "20px" }}>
        <Input
          placeholder="Ask something about your journal..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="primary" block onClick={queryJournal} style={{ marginTop: "10px" }}>
          Ask
        </Button>
      </Card>
      
      {response && (
        <Card>
          <h2 style={{ fontWeight: "bold" }}>AI Response:</h2>
          <p>{response}</p>
        </Card>
      )}
    </div>
  );
}
