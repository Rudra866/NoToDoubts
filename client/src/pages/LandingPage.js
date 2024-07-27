import React from "react";
import {Link} from "react-router-dom";
import logo from "../Components/Faviicon.webp";

const LandingPage = () => {
    return (
        <div className="App">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                    </nav>

                </header>
            </div>
            <main>
                <div className='title'>
                    <h2>Can't get the error out?</h2>
                    <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                    <h2>Sign Up NOW and Get the experts to solve it!</h2>
                </div>

                    <div  className='LoginAndSignUp'>
                        <Link to='/signUp' className='Sign-Up-button'>Sign Up</Link>
                        <Link to="/login" className="login-button" >Login</Link>

                </div>
            </main>
        </div>
    );
};
export default LandingPage;