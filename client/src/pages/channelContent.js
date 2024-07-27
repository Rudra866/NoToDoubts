import React, {useState, useEffect, useContext} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReplyForm from "../Components/replyForm";
import organizeReplies from "../function/organzieReplies";
import logo from "../Components/Faviicon.webp";
import MessageInput from "../Components/Messageinput";
import DeleteConfirm from "../Components/deleteConfirm";
import { useLocation } from 'react-router-dom';
const ChannelContent = () => {
    const { channelName } = useParams();
    const{channelId,userRole,userId} = useParams();
    const [qaList, setQaList] = useState([]);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const filteredQAs = qaList.filter(qa =>
        (qa.title.toLowerCase().includes(searchQuery.toLowerCase()) || qa.text.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (userSearch === '' || qa.creatorName.toLowerCase().includes(userSearch.toLowerCase()))
    );

    const [channelCreator, setChannelCreator] = useState('');
    useEffect(()=>{fetchMessages();fetchChannelCreator()},[channelCreator,sortOrder]);
    const countPostsPerUser = (posts) => {
        return posts.reduce((acc, post) => {
            acc[post.creatorName] = (acc[post.creatorName] || 0) + 1;
            return acc;
        }, {});
    };

    const handleSendMessage = async (title, message, screenshotUrl) => {
        // Construct the message data object
        const messageData = {
            title,
            message,
            userId,
            channelId,
            channelName,
            screenshotUrl: screenshotUrl ? screenshotUrl : null,
        };
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    // Process JSON response
                    const responseData = await response.json();
                    throw new Error(responseData.message || 'Failed to send message');
                } else {
                    // Handle non-JSON response
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to send message');
                }
            }

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message || 'Failed to send message');
            }

            const addedMessage = await response.json();
            fetchMessages();
            setMessages(prevMessages => [...prevMessages, addedMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }

    };
    const fetchChannelCreator = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${channelId}/creator`);
            const data = await response.json();
            console.log("Received data:", data); // Log the received data
            setChannelCreator(data.fullname);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/channels/${channelId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Count and sort posts per user
            const postsCount = countPostsPerUser(data);
            const sortedUsers = Object.entries(postsCount).sort((a, b) => {
                return sortOrder === 'desc' ? b[1] - a[1] : a[1] - b[1];
            });

            // Reorganize the qaList based on sortedUsers
            const sortedQaList = sortedUsers.map(([userName]) => {
                return data.filter(qa => qa.creatorName === userName);
            }).flat();

            setQaList(sortedQaList);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleTitleClick = (qa) => {
        // Navigate to a new route with the question details
        navigate(`/channels/${userId}/${userRole}/${channelId}/${channelName}/question-details/${qa.id}/${qa.title}/${qa.text}`);
    };
    const [deleteConfirmData, setDeleteConfirmData] = useState({ show: false, messageId: null });
    const handleDeleteClick = (messageId, messageTitle) => {
        setDeleteConfirmData({ show: true, messageId, messageTitle });
    };

    const handleDeleteMessage = async () => {
        const messageId = deleteConfirmData.messageId;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/messages/${messageId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            setQaList(prevQAs => prevQAs.filter(qa => qa.id !== messageId));
            setDeleteConfirmData({ show: false, messageId: null });
        } catch (error) {
            console.error('Error deleting message:', error);
            setDeleteConfirmData({ show: false, messageId: null });
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmData({ show: false, messageId: null });
    };

    const handleAddQuestion = () => {
        setShowMessageInput(!showMessageInput);
    };    return (
        <main className="main-content">
            <div>
                <header className="App-header">
                    <nav className="header-nav">
                        <img src={logo} alt="No To Doubts Logo" className="logo" />
                        <h1>No To Doubts</h1>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Q&As"
                            className='search-box'
                        />
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search by user"
                            className='search-box'
                        />
                    </nav>

                </header>
            </div>
            <div className="content-container">
                <h2 className="content-title">{channelName}</h2>
                <h4>Channel created by {channelCreator} </h4>
                <div className="cta">
                    <button onClick={handleAddQuestion} className="cta-button">Add Question</button>
                    <button className='cta-buton' onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                        Sort by {sortOrder === 'desc'? 'Least' :'Most'} Posts
                    </button>
                </div>
                {showMessageInput && (
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        onPost={() => setShowMessageInput(false)} // Pass the toggle function
                    />
                )}
                <div className="qa-list">
                    {Array.isArray(filteredQAs) && filteredQAs.map((qa, index) => (
                        <div key={index} className="qa-item-container">
                            <div
                                className="qa-item"
                                onClick={() => handleTitleClick(qa)}
                                role="button"
                                tabIndex={0}
                            >
                                <h3 className="qa-title">{qa.title}</h3>
                                <h6>Created by : {qa.creatorName}</h6>
                            </div>
                            {userRole === 'developer' && (
                                <button
                                    onClick={() => handleDeleteClick(qa.id,qa.title)}
                                    className="action-button delete-button"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <DeleteConfirm
                show={deleteConfirmData.show}
                itemName={deleteConfirmData.messageTitle}
                onConfirm={handleDeleteMessage}
                onCancel={handleCancelDelete}
            />
        </main>
    );
};
export default ChannelContent;
