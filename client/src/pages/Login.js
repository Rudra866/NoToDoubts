import React, { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import logo from "../Components/Faviicon.webp";

const Login = ({onLogin}) => {
    const nav = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [userRole, setUserRole] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }));
    };

    const handleSubmit = (e ) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })
            .then(response =>  { if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
         })
            .then(data => {
                console.log("Login response data:", data);
                if (data.status === 'ok') {
                    setUserRole(data.user.role);
                    onLogin(true,data.token,data.user.id);
                    nav(`/DashBoard/${data.user.id}/${data.user.role}`);
                } else {
                    alert("Login failed");
                    onLogin(false);
                }
            })

        setCredentials({ email: '', password: '' });
    };

    return (

        <div className="login-page">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                    </nav>

                </header>
            </div>
            <form onSubmit={handleSubmit} className="login-form">
                <h1>Login</h1>
                <br></br>
                <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Username"
                    className="login-input"
                />
                <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="login-input"
                />
                <button type="submit" className="login-button">
                    Login
                </button>
                <br></br>
                <p>Don't have an account?</p>
                <Link to='/signUp' className='Sign-Up-button'>Sign Up</Link>
            </form>

        </div>
    );
};

export default Login;
