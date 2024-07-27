import React, {useEffect, useState} from 'react';

import '../App.css';
import SignUp from "./SignUp";
import {Link, useNavigate} from "react-router-dom";
import {useParams} from "react-router-dom";
import logo from "../Components/Faviicon.webp";


const DashBoard = ({onLogout}) => {
    const nav = useNavigate();
    const {userId:paramUserId} = useParams();
    const {userRole} = useParams();
    const [userId, setUserId] = useState(paramUserId || localStorage.getItem('userId'));
    const handleLogOut = () => {
        onLogout();
        nav('/');
    }

    const handleUseNav = () => {
        nav(`/channels/${paramUserId}/${userRole}`);
    };
    useEffect(() => {
        // If there is no userId in the URL params, try getting it from localStorage
        if (!paramUserId) {
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                setUserId(storedUserId);
            }
        }
    }, [paramUserId]);
    return (

        <div className="App">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts </h1>
                    </nav>
                    <div>
                        <button onClick={handleLogOut} className="login-button">
                            Log Out
                        </button>
                    </div>
                </header>
            </div>
            <main>
                <section className="introduction">
                    <div className='title'>
                    <h2 >Welcome to No To Doubts</h2>
                    <p>A tool designed to help programmers solve issues and share knowledge.</p>
                        </div>
                </section>

                <section className="features">
                    <div className="feature">
                        <h3>Post Programming Questions</h3>
                        <p>Share your programming challenges and get help from the community.</p>
                    </div>
                    <div className="feature">
                        <h3>Provide Answers/Responses</h3>
                        <p>Contribute by answering questions and sharing your expertise.</p>
                    </div>
                    <div className="feature">
                        <h3>Create and View Channels</h3>
                        <p>Organize discussions in channels based on topics or technologies.</p>
                    </div>
                    <div className="feature">
                        <h3>Post Messages and Replies</h3>
                        <p>Engage in discussions, share ideas, and collaborate.</p>
                    </div>
                </section>


                <section className="cta">
                    <button onClick={handleUseNav}>Get Started</button>
                    <a href="/demo">Watch a Demo</a>
                    {userRole === 'developer' && (
                        <button onClick={() => nav('/user_management')}>User Management</button>
                    )}
                </section>
            </main>
        </div>
    );
}

export default DashBoard;
