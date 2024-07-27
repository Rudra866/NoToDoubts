import React, { useState } from 'react';

const ReplyForm = ({ messageId, onReply }) => {
    const [reply, setReply] = useState('');
    const [showReplyBox, setShowReplyBox] = useState(false);
    const handleReplyChange=(e)=>{
        setReply(e.target.value);
    }

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (reply.trim()) {
            console.log('Submitting reply:', reply); // Debug log
            onReply(reply);
            setReply('');
            setShowReplyBox(false);
        }
    };

    return (
        <div className="reply-container">
            {!showReplyBox && (
                <button onClick={() => setShowReplyBox(true)} className="reply-button">
                    Reply
                </button>
            )}
            {showReplyBox && (
                <form onSubmit={handleReplySubmit} className="reply-form">
                    <textarea
                        value={reply}
                        onChange={handleReplyChange}
                        className="reply-textarea"
                        placeholder="Type your reply here..."
                        required
                    />
                    <button type="submit" className="send-reply-button">Send</button>
                    <button type="button" onClick={() => setShowReplyBox(false)} className="cancel-reply-button">
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

export default ReplyForm;
