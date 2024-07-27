import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import DashBoard from "./pages/DashBoard";
import Login from "./pages/Login";

import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import {useEffect, useState} from "react";
import Question_details from "./pages/question_details";
import ChannelPage from "./pages/ChannelsPage";

import ChannelContent from "./pages/channelContent";
import UserManagement from "./Components/UserManegement";
import UploadScreenshot from "./Components/Ss";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      const localUserId = localStorage.getItem('userId');
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);
      setUserId(loggedIn ? localUserId : null); // Set userId based on the loggedIn status
    };
    window.addEventListener('storage', checkLogin); // Update login status if localStorage changes

    checkLogin(); // Initial check

    return () => {
      window.removeEventListener('storage', checkLogin); // Clean up listener
    };
  }, []);

  const handleLogin = (status, token, id) => {
    setIsLoggedIn(status);
    if (status && token && id) {
      localStorage.setItem('token', token);localStorage.setItem('userId', id);
      setUserId(id);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUserId(null);
    }
  };
  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserId(null);
  }

  return (
      <Router>
    <div className="App">
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/DashBoard/:userId/:userRole' element={<DashBoard onLogout={handleLogOut} />} />
          <Route path='/login' element= {<Login onLogin={handleLogin}/>}/>
          <Route path='/signUp' element = {<SignUp/>}/>
          <Route path='/channels/:userId/:userRole' element={<ChannelPage/>}/>
          <Route path="/channels/:userId/:userRole/:channelId/:channelName" element={<ChannelContent/>} />
          <Route path="/channels/:userId/:userRole/:channelId/:channelName/question-details/:messageId/:title/:text" element={<Question_details />} />
          <Route path="/user_management" element={<UserManagement/>}/>
        </Routes>

    </div>
        </Router>
  );
}

export default App;
