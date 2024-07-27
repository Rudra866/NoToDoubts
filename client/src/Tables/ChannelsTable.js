import React, {useState} from 'react';
import DeleteConfirm from "../Components/deleteConfirm";
import {useNavigate} from "react-router-dom";
import {useParams} from "react-router-dom";

const ChannelsTable = ({ channels,onToggleModal,onToggleDelete }) => {
    const nav = useNavigate();
    const {userId} = useParams();
    const {userRole} = useParams();
        return (
        <div className="table-container">
            <div className="table-header">
                <h2>Channels Table</h2>
                <section className="cta">
                    <button  onClick={onToggleModal}>Add Channel</button>
                </section>

            </div>
            <table className="channels-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {channels.map((channel) => (
                    <tr key={channel.id}>
                        <td>{channel.name}</td>
                        <td>{channel.description}</td>
                        <td>
                            <button onClick={() => nav(`/channels/${userId}/${userRole}/${channel.id}/${channel.name}`)} className="action-button delete-button">Open</button>
                            {userRole==='developer'&&(
                            <button onClick={() => onToggleDelete(channel.id, channel.name)} className="action-button delete-button">
                                Delete
                            </button>
                                )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ChannelsTable;
