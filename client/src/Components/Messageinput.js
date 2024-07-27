import React, { useState } from 'react';
import UploadScreenshot from './Ss';
import { useNavigate, useParams } from 'react-router-dom';
import logo from './Faviicon.webp';

const MessageInput = ({ onSendMessage, onPost }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [screenshotId, setScreenshotId] = useState(null);
    const { channelId, userId, userRole,channelName } = useParams();
    const [showUpload, setShowUpload] = useState(false);
    const n = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSendMessage(title, message, screenshotId);
        n(`/channels/${userId}/${userRole}/${channelId}/${channelName}`);
        setTitle('');
        setMessage('');
        setScreenshotId(null);
        setShowUpload(false);
        onPost();
    };


    const handleUpload = (screenshotId) => {
        setScreenshotId(screenshotId);
    };

    const toggleUploadForm = () => {
        setShowUpload(!showUpload);
    };

    return (

        <form onSubmit={handleSubmit} className="message-input-form">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                    </nav>

                </header>
            </div>
            <label htmlFor="title" className="title-label">Title</label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Be specific and imagine you’re asking a question to another person."
                className="title-input"
                required
            />
            <label htmlFor="message" className="message-label">What are the details of your problem?</label>
            <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce the problem and expand on what you put in the title. Minimum 20 characters."
                className="message-textarea"
                required
            />
            <button type="button" onClick={toggleUploadForm} className="upload-screenshot-button">
                {showUpload ? 'Cancel Upload' : 'Upload Screenshot'}
            </button>

            {showUpload && (
                <div className="upload-modal">
                    <div className="upload-modal-content">
                        <UploadScreenshot onUpload={handleUpload} />
                        <button onClick={toggleUploadForm} className="close-modal-button">Close</button>
                    </div>
                </div>
            )}

            <button type="submit" className="send-message-button">Post</button>
        </form>
    );
};

export default MessageInput;