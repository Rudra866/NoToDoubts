import React from 'react';

const ReplyItem = ({ reply, onVote, userId }) => {
    // Handle upvote
    const handleUpvote = async () => {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/reply/${reply.id}/upvote`, {
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
            await fetch(`${process.env.REACT_APP_API_URL}/reply/${reply.id}/downvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            onVote(); // Refresh the reply list with updated vote counts
        } catch (error) {
            console.error('Error downvoting:', error);
        }
    };
    const handleUnvote = async () => {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/reply/${reply.id}/unvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            onVote(); // Refresh the reply list with updated vote counts
        } catch (error) {
            console.error('Error unvoting:', error);
        }
    };

    return (
        <div className="message-item">
            <p className="message-text">{reply.text}</p>
            <div className="vote-buttons">
                <button onClick={handleUpvote} className="vote-button upvote">👍 {reply.upVote}</button>
                <button onClick={handleDownvote} className="vote-button downvote">👎 {reply.downVote}</button>
                <button onClick={handleUnvote} className="vote-button unvote">🔄</button>
            </div>
        </div>
    );
};

export default ReplyItem;
