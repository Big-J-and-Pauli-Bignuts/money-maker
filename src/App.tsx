import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import Reminders from "./components/Reminders";
import Chat from "./components/Chat";
import { SharePointPage, DataversePage } from "./components/NLP";
import "./App.css";

/**
 * Main App Component with routing
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="chat" element={<Chat />} />
          <Route path="sharepoint" element={<SharePointPage />} />
          <Route path="dataverse" element={<DataversePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
