import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import logo from "../Components/Faviicon.webp";

const SignUp = () => {
    const nav = useNavigate();
    const [userData, setUserData] = useState({
        fullname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setUserData({...userData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alert("Signup successful");
                    nav(`/login`);
                } else {
                    alert("Signup failed");
                }
            })
            .catch(error => {
               alert('Error: User with this email already Exists');
            });

        setUserData({ fullname: '', email: '', password: '' });
    };



    return (
        <div className='sign-up-container'>
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                    </nav>

                </header>
            </div>
            <h1 className='sign-up-title'>Sign Up</h1>
            <form onSubmit={handleSubmit} className='sign-up-form'>
                <input
                    type="text"
                    name="fullname"
                    value={userData.fullname}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className='sign-up-input'
                />
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className='sign-up-input'
                />
                <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className='sign-up-input'
                />
                <button type="submit" className='Sign-Up-button'>Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;
