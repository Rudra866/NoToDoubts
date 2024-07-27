import React from 'react';

const MessageItem = ({ message, onVote, userId }) => {
    // Handle upvote
    const handleUpvote = async () => {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/message/${message.id}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            onVote(); // Refresh the reply list with updated vote counts
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };


    // Handle downvote
    const handleDownvote = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/message/${message.id}/downvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                onVote(); // Refresh the message list with updated vote counts
            } else {
                console.error('Failed to downvote message');
            }
        } catch (error) {
            console.error('Error downvoting message:', error);
        }
    };


    // Handle unvote
    const handleUnvote = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/message/${message.id}/unvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                onVote(); // Refresh the message list with updated vote counts
            } else {
                console.error('Failed to unvote message');
            }
        } catch (error) {
            console.error('Error unvoting message:', error);
        }
    };


    return (
        <div className="message-item">
            <p className="message-text">{message.text}</p>
            <div className="vote-buttons">
                <button onClick={handleUpvote} className="vote-button upvote">👍 {message.upVote}</button>
                <button onClick={handleDownvote} className="vote-button downvote">👎 {message.downVote}</button>
                <button onClick={handleUnvote} className="vote-button unvote">🔄</button>
            </div>
        </div>
    );
};

export default MessageItem;
