import React, { useState, useEffect } from 'react';
import AddChannelModal from "../Components/AddChannel";
import ChannelsTable from "../Tables/ChannelsTable";
import DeleteConfirm from "../Components/deleteConfirm";
import logo from "../Components/Faviicon.webp";
import {useParams} from "react-router-dom";


const ChannelsPage = () => {
    const [channels, setChannels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const {userId} = useParams();
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmData, setDeleteConfirmData] = useState({ show: false, channelId: null, channelName: '' });


    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {


        const response = await fetch(`${process.env.REACT_APP_API_URL}/channels`);
        const data = await response.json();
        setChannels(data);
    };

    const handleAddChannel = async (channelData) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: channelData.name,
                description: channelData.description,
                userId,
            }),
        });
        if (response.ok) {
            const newChannel = await response.json();
            setChannels([...channels, newChannel]);
            setShowModal(false); // Close the modal after adding the channel
        }
    };

    const handleDeleteChannel = async (channelId) => {
        setChannels(currentChannels => currentChannels.filter(channel => channel.id !== channelId));
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${channelId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setChannels(channels.filter(channel => channel.id !== channelId));
            } else {
                console.error('Failed to delete the channel');
            }
        } catch (error) {
            console.error('Error deleting channel:', error);
            await fetchChannels();
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleDeleteConfirm = (channelId = null, channelName = '') => {
        setDeleteConfirmData({ show: !deleteConfirmData.show, channelId, channelName });
    };

    const handleConfirmDelete = async () => {
        await handleDeleteChannel(deleteConfirmData.channelId);
        toggleDeleteConfirm();
    };

    return (
        <div>
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search channels"
                            className="search-box"
                        />

                    </nav>

                </header>

            </div>

            <ChannelsTable
                channels={filteredChannels}
                onToggleModal={toggleModal}
                onToggleDelete={toggleDeleteConfirm}
            />
            <AddChannelModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onAddChannel={handleAddChannel}
                userId={userId}
            />
            <DeleteConfirm
                show={deleteConfirmData.show}
                itemName={deleteConfirmData.channelName}
                onConfirm={handleConfirmDelete}
                onCancel={() => toggleDeleteConfirm({ ...deleteConfirmData, show: false })}
            />

        </div>
    );
};

export default ChannelsPage;
