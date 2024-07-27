import React, { useState } from 'react';
import logo from "./Faviicon.webp";
import {useParams} from "react-router-dom";

const AddChannelModal = ({ show, onClose, onAddChannel,userId }) => {
    const [channelName, setChannelName] = useState('');
    const [channelDescription, setChannelDescription] = useState('');


    const handleSubmit = (event) => {
        event.preventDefault();
        onAddChannel({
            name: channelName,
            description: channelDescription,
            userId,
        });
        setChannelName('');
        setChannelDescription('');
        onClose();
    };

    return (
        <div className={`modal ${show ? 'show' : ''}`}>

            <div className="modal-content">

                <span className="close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="Channel Name"
                        required
                    />
                    <textarea
                        value={channelDescription}
                        onChange={(e) => setChannelDescription(e.target.value)}
                        placeholder="Channel Description"
                    />
                    <button type="submit">Add Channel</button>
                </form>
            </div>

            </div>
    );
};

export default AddChannelModal;
