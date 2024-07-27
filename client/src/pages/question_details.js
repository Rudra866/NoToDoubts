import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReplyForm from "../Components/replyForm";
import logo from "../Components/Faviicon.webp";
import DeleteConfirm from "../Components/deleteConfirm";
import ReplyItem from "../Components/replyLike";
import MessageLike from "../Components/messageLike";

const Question_details = () => {
    const { userId, messageId, title, text,userRole } = useParams();
    const [replies, setReplies] = useState([]);
    const [message,setMessage] = useState([]);
    const [rankingSearch, setRankingSearch] = useState('');
    const [sortRanking, setSortRanking] = useState('highest');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredReplies = replies.filter(reply =>
        reply.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const calculateUserRankings = (replies) => {
        const userVotes = replies.reduce((acc, reply) => {
            const netVotes = reply.upVote - reply.downVote;
            acc[reply.replierName] = (acc[reply.replierName] || 0) + netVotes;
            return acc;
        }, {});

        return Object.entries(userVotes).sort((a, b) =>
            sortRanking ==='highest' ? b[1] - a[1] : a[1] - b[1]
        );
    };
    const userRankings = calculateUserRankings(replies);
    const filteredRankings = userRankings.filter(([username]) =>
        username.toLowerCase().includes(rankingSearch.toLowerCase())
    );

    useEffect(()=>{fetchReplies(); fetchMessage()},[])
    const fetchReplies = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${messageId}/replies`);
            if (!response.ok) {
                throw new Error('Failed to fetch replies');
            }
            const data = await response.json();
            setReplies(data); // Assuming the server response includes a replierName property for each reply
        } catch (error) {
            console.error('Fetch replies error:', error);
        }
    };
    const fetchMessage = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/message/${messageId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch message');
            }
            const data = await response.json();
            setMessage(data); // Set the whole data object to message state
        } catch (error) {
            console.error('Fetch message error:', error);
        }
    };



    const handleReply = async (replyText) => {
        const replyData = {
            text: replyText,
            userId,
            messageId
        };
        console.log('Sending reply:', replyData); // Debug log

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${messageId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(replyData)
            });
fetchReplies();
            if (response.ok) {
                console.log('Reply sent successfully');
                // Consider re-fetching replies here to update the list
            } else {
                console.error('Failed to send reply');
            }
        } catch (error) {
            console.error('Reply post error:', error);
        }
    };
    const [deleteConfirmData, setDeleteConfirmData] = useState({ show: false, replyId: null });
    const handleDeleteClick = (replyId, reply) => {
        setDeleteConfirmData({ show: true, replyId, reply });
    };
    const handleDeleteMessage = async () => {
        const replyId = deleteConfirmData.replyId;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reply/${replyId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete reply');
            }
            setReplies(prevReply => prevReply.filter(reply => reply.id !== replyId));
            setDeleteConfirmData({ show: false, ReplyId: null });
        } catch (error) {
            console.error('Error deleting reply:', error);
            setDeleteConfirmData({ show: false, replyId: null });
        }
    };
    const handleCancelDelete = () => {
        setDeleteConfirmData({ show: false, replyId: null });
    };


    return (
        <div className="question-details-container">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search replies"
                            className='search-box'
                        />
                    </nav>

                </header>
            </div>
            <h1 className="question-title">{title}</h1>
            <p className="question-text">{text}</p>
            <h6 className='question-text'>Question posted by: {message.creatorName}</h6>
            <MessageLike message={message} userId={userId} onVote={fetchMessage}/>
            <ReplyForm onReply={handleReply} />
            <div className="replies-list">
                {filteredReplies.length > 0 ? filteredReplies.map((reply, index) => (
                    <div key={index} className="reply-item">
                        <p>{reply.text}</p>
                        <h6>Replied by: {reply.replierName}</h6>
                        <ReplyItem reply={reply} onVote={fetchReplies} userId={userId} />
                        {userRole === 'developer' && (
                            <button
                                onClick={() => handleDeleteClick(reply.id)}
                                className="action-button delete-button"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )) : (
                    <p>No replies yet.</p>
                )}
            </div>
            <DeleteConfirm
                show={deleteConfirmData.show}
                itemName={deleteConfirmData.reply}
                onConfirm={handleDeleteMessage}
                onCancel={handleCancelDelete}
            />
            <div className="ranking-search">
                <input
                    type="text"
                    value={rankingSearch}
                    onChange={(e) => setRankingSearch(e.target.value)}
                    placeholder="Search user rankings"
                />
                <button onClick={() => setSortRanking(sortRanking === 'highest' ? 'lowest' : 'highest')}>
                    {sortRanking === 'highest' ? 'Show Lowest Ranking' : 'Show Highest Ranking'}
                </button>
            </div>
            <div className="user-rankings">
                {filteredRankings.map(([username, netVotes], index) => (
                    <div key={index}>
                        <p>{username}: {netVotes} votes</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Question_details;
