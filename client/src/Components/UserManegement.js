import React, { useEffect, useState } from 'react';
import logo from "./Faviicon.webp";
import DeleteConfirm from "./deleteConfirm";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [deleteConfirmData, setDeleteConfirmData] = useState({ show: false, userId: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        const data = await response.json();
        setUsers(data);
    };

    const handleDeleteClick = userId => {
        console.log(`Delete button clicked for user ID: ${userId}`);
        setDeleteConfirmData({ show: true, userId });
    };

    const handleDeleteUser = async () => {
        const userId = deleteConfirmData.userId;
        console.log(`Attempting to delete user with ID: ${userId}`);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setDeleteConfirmData({ show: false, userId: null });
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmData({ show: false, userId: null });
    };

    return (
        <div className="user-management-container">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                    </nav>

                </header>
            </div>
            <h1>User Management</h1>
            <ul className="user-management-list">
                {users.map(user => (
                    <li key={user.id} className="user-management-item">
                        {user.fullname} - {user.email}
                        <button onClick={() => handleDeleteClick(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <DeleteConfirm
                show={deleteConfirmData.show}
                itemName={deleteConfirmData.userId}
                onConfirm={handleDeleteUser}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

export default UserManagement;
