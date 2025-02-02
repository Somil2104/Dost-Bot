import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import JournalEntry from "./pages/JournalEntry";
import ChatPage from "./pages/ChatPage";
import "antd/dist/reset.css"; // Ant Design styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/journal" element={<JournalEntry />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
