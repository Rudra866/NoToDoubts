'use strict';

const mysql = require('mysql2');
const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const hash = 10;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')  // Make sure this path exists and is writable
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

var connection;

function DataBase() {
    connection = mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'adminadmin',
        database: 'db'
    });
    connection.connect();
    connection.query(`CREATE DATABASE IF NOT EXISTS db`, function (error) {
        if (error) {
            console.error('Error creating database');
            return;
        }
        connection.query('USE db', function (error, result) {
            if (error) {
                console.error('Error using database');
                return;
            }
            connection.query(`CREATE TABLE IF NOT EXISTS login (
             id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                )`, function (error) {
                if (error) {
                    console.error('Error creating table login');
                    return;
                }
                console.log('Table login created or already exists');
            });
            connection.query(`
                CREATE TABLE IF NOT EXISTS signup (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    fullname VARCHAR(100),
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(225) NOT NULL,       
                    role ENUM("developer","user") NOT NULL DEFAULT "user",            
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`, function (error) {
                if (error) {
                    console.error('Error creating table signup');
                    return;
                }
                console.log('Table signup created or already exists.');
            });
            connection.query(`
                CREATE TABLE IF NOT EXISTS channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                user INT,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user) REFERENCES signup(id)
                )
            `, function (error) {
                if (error) {
                    console.log('Error Creating channels table');
                    return;
                }
                console.log('Table channels has been created or exists')
            })
            connection.query(`
                 CREATE TABLE IF NOT EXISTS ss(
                 id INT AUTO_INCREMENT PRIMARY KEY,
                 url VARCHAR(255),
                 time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `, function (error) {
                if (error) {
                    console.error('Error creating table screenshots', error);
                    return;
                }
                console.log('Table screenshots created or already exists');
            });
            connection.query(`
                CREATE TABLE IF NOT EXISTS messages(
                id INT AUTO_INCREMENT PRIMARY KEY,
                text TEXT,
                title TEXT,
                user_id INT,
                channelID INT,
                ssID INT,
                upVote INT DEFAULT 0,
                downVote INT DEFAULT 0, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES signup(id),
                FOREIGN KEY (channelID) REFERENCES channels(id)
    
                )`, function (error) {
                if (error) {
                    console.error('Error creating table messages', error);
                    return;
                }
                console.log('Table messages created or already exists');
            });
            connection.query(`
                CREATE TABLE IF NOT EXISTS reply(
                id INT AUTO_INCREMENT PRIMARY KEY,
                text TEXT,
                user_id INT,
                messageID INT,
                upVote INT DEFAULT 0,
                downVote INT DEFAULT 0,
 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES signup(id)
   
              
                )
            `, function (error) {
                if (error) {
                    console.error('Error creating table replies', error);
                    return;
                }
                console.log('Table replies created or already exists');
            });
            connection.query(`
    CREATE TABLE IF NOT EXISTS reply_votes (
        user_id INT,
        reply_id INT,
        voteType ENUM('up', 'down') NOT NULL,
        CONSTRAINT pk_reply_votes PRIMARY KEY (user_id, reply_id),
        CONSTRAINT fk_reply_votes_user FOREIGN KEY (user_id) REFERENCES signup(id) ON DELETE CASCADE,
        CONSTRAINT fk_reply_votes_reply FOREIGN KEY (reply_id) REFERENCES reply(id) ON DELETE CASCADE
    )`, function (error) {
                if (error) {
                    console.error('Error creating reply_vote', error);
                    return;
                }
                console.log('Table reply_vote created or already exists');
            });
            connection.query(`CREATE TABLE IF NOT EXISTS message_votes (
    user_id INT,
    message_id INT,
    voteType ENUM('up', 'down') NOT NULL,
    CONSTRAINT pk_message_votes PRIMARY KEY (user_id, message_id),
    CONSTRAINT fk_message_votes_user FOREIGN KEY (user_id) REFERENCES signup(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_votes_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE 
)`, function (error) {
                if (error) {
                    console.error('Error creating reply_vote', error);
                    return;
                }
                console.log('Table reply_vote created or already exists');
            });
        });
    });
}


app.get('/init', (req, res) => {
    DataBase();
});

app.post('/channels', (req, res) => {
    const { name, description, userId } = req.body;
    const query = `INSERT INTO channels (name,description,user) VALUES (?,?,?)`;

    connection.query(query, [name, description, userId], (error, result) => {
        if (error) {
            console.error('Error adding channel:', error.message);
            res.status(500).send('Error adding channel.');
        } else {
            console.log('channel added successfully.');
            res.status(201).send({ status: 'ok', postId: result.insertId, name, description, user: userId });
        }
    });
});

app.get('/channels', (req, res) => {
    connection.query(`SELECT * FROM channels`, (error, results) => {
        if (error) {
            console.error('Error retrieving channels:', error.message);
            res.status(500).send('Error retrieving channels.');
        } else {
            res.status(200).send(results);
        }
    });
});
app.get('/users', (req, res) => {
    connection.query(`SELECT * FROM signup WHERE role != 'Developer'`, (error, results) => {
        if (error) {
            console.error('Error retrieving users:', error.message);
            res.status(500).send('Error retrieving users.');
        } else {
            res.status(200).send(results);
        }
    });
});
app.get('/channels/:channelId', (req, res) => {
    const { channelId } = req.params;
    const query = `
        SELECT m.*, s.fullname as creatorName
        FROM messages m
        JOIN signup s ON m.user_id = s.id
        WHERE m.channelID = ?
    `;

    connection.query(query, [channelId], (error, results) => {
        if (error) {
            console.error('Error retrieving messages:', error.message);
            res.status(500).send('Error retrieving messages.');
        } else {
            res.status(200).send(results);
        }
    });
});
app.get('/channels/:messageId/replies', (req, res) => {
    const { messageId } = req.params;
    const query = `
        SELECT r.*, s.fullname as replierName
        FROM reply r
        JOIN signup s ON r.user_id = s.id
        WHERE r.messageID = ?
    `;
    connection.query(query, [messageId], (error, results) => {
        if (error) {
            console.error('Error retrieving replies:', error.message);
            res.status(500).send('Error retrieving replies');
        } else {
            res.status(200).send(results);
        }
    });
});
app.get('/message/:messageId', async (req, res) => {
    const { messageId } = req.params;
    const query = `
        SELECT m.*, s.fullname as creatorName
        FROM messages m
        JOIN signup s ON m.user_id = s.id
        WHERE m.id = ?
    `;

    connection.query(query, [messageId], (error, results) => {
        if (error) {
            console.error('Error fetching message:', error.message);
            return res.status(500).send('Error fetching message.');
        }

        if (results.length === 0) {
            return res.status(404).send('Message not found.');
        }

        // Assuming the first result is the desired message
        const message = results[0];
        res.status(200).send(message);
    });
});

app.get('/channels/:channelId/creator', async (req, res) => {
    const { channelId } = req.params;

    const query = `
        SELECT s.fullname
        FROM channels c
        JOIN signup s ON c.user = s.id
        WHERE c.id = ?
    `;

    connection.query(query, [channelId], (error, results) => {
        if (error) {
            console.error('Error fetching channel creator:', error);
            res.status(500).send('Error fetching channel creator');
        } else if (results.length > 0) {
            res.status(200).send(results[0]);
            console.log(results[0]);
        } else {
            res.status(404).send('Channel creator not found');
        }
    });
});

const checkLogin = (email, password) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM signup WHERE email = ?';
        connection.query(query, [email], async (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                const user = results[0];
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (passwordMatch) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            } else { resolve(null); }
        });
    });
};

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await checkLogin(email, password);
        if (user) {
            res.send({ status: 'ok', message: 'Login successful', user, userId: user.id });
        } else {
            res.status(401).send({ status: 'error', message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ status: 'error', message: 'An error occurred' });
    }
});
// Signup route
app.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    const HashPassword = await bcrypt.hash(password, hash);
    const query = 'INSERT INTO signup (fullname, email, password) VALUES (?, ?, ?)';

    connection.query(query, [fullname, email, HashPassword], (error, results) => {
        if (error) {
            console.error('Error during signup:', error.message);
            res.status(500).send('Error during signup.');
            return;
        }
        console.log('Signup successful.');
        res.status(201).send({ status: 'ok', message: 'Signup successful' });
    });
});

app.delete('/channels/:id', (req, res) => {
    const { id } = req.params;

    // Begin transaction
    connection.beginTransaction(err => {
        if (err) {
            console.error('Transaction Begin Error:', err);
            return res.status(500).send('Error beginning transaction.');
        }

        // First, delete replies associated with the messages of the channel
        const deleteRepliesQuery = `
            DELETE reply 
            FROM reply 
            JOIN messages ON reply.messageID = messages.id 
            WHERE messages.channelID = ?
        `;

        connection.query(deleteRepliesQuery, [id], (error, result) => {
            if (error) {
                console.error('Error deleting associated replies:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error deleting associated replies.');
                });
            }

            // Next, delete messages associated with the channel
            connection.query(`DELETE FROM messages WHERE channelID = ?`, [id], (error, result) => {
                if (error) {
                    console.error('Error deleting associated messages:', error.message);
                    return connection.rollback(() => {
                        res.status(500).send('Error deleting associated messages.');
                    });
                }

                // Finally, delete the channel itself
                connection.query(`DELETE FROM channels WHERE id = ?`, [id], (error, result) => {
                    if (error) {
                        console.error('Error deleting channel:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error deleting channel.');
                        });
                    }

                    // Commit the transaction
                    connection.commit(err => {
                        if (err) {
                            console.error('Transaction Commit Error:', err);
                            return connection.rollback(() => {
                                res.status(500).send('Error during transaction commit.');
                            });
                        }
                        res.status(200).send({ status: 'ok', message: 'Channel deleted successfully', channelId: id });
                    });
                });
            });
        });
    });
});
app.delete("/reply/:replyId", (req, res) => {
    const replyId = parseInt(req.params.replyId);
    if (!replyId) {
        console.log('Invalid reply ID received:', req.params.replyId);
        return res.status(400).send({
            status: 'error', message: 'Invalid reply ID'
        });
    }
    connection.query('DELETE FROM reply WHERE id = ?', [replyId], (error, Results) => {
        if (error) {
            console.error('Error deleting reply:', error.message);
            return connection.rollback(() => {
                res.status(500).send('Error deleting reply.');
            });
        }
        console.log(`Reply with ID ${replyId}  deleted successfully.`);
        res.status(200).send({ status: 'ok', message: 'Message and associated replies deleted successfully' });
    });
});
app.delete('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userId) {
        console.log('Invalid user Id:', req.params.userId);
        return res.status(400).send({
            status: 'error', message: 'Invalid user Id'
        });
    }
    connection.query(`DELETE FROM signup WHERE id = ?`, [userId], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error.message);
            return connection.rollback(() => {
                res.status(500).send('Error deleting user');
            });
        }
        console.log(`User with ID ${userId} deleted`);
        res.status(200).send({ status: 'ok', message: 'User deleted' });
    });
});
app.delete('/messages/:messageId', (req, res) => {
    const messageId = parseInt(req.params.messageId);

    console.log(`Attempting to delete message with ID: ${messageId}`);

    if (!messageId) {
        console.log('Invalid message ID received:', req.params.messageId);
        return res.status(400).send({ status: 'error', message: 'Invalid message ID' });
    }

    // Begin a transaction to handle related data
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // First delete replies associated with the message
        connection.query('DELETE FROM reply WHERE messageID = ?', [messageId], (error, replyResults) => {
            if (error) {
                console.error('Error deleting associated replies:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error deleting associated replies.');
                });
            }

            // Then delete the message
            connection.query('DELETE FROM messages WHERE id = ?', [messageId], (error, messageResults) => {
                if (error) {
                    console.error('Error deleting message:', error.message);
                    return connection.rollback(() => {
                        res.status(500).send('Error deleting message.');
                    });
                }

                if (messageResults.affectedRows === 0) {
                    console.log(`No message found with ID: ${messageId}`);
                    return res.status(404).send({ status: 'error', message: 'Message not found' });
                }
                // Commit the transaction
                connection.commit(err => {
                    if (err) {
                        console.error('Transaction Commit Error:', err);
                        return connection.rollback(() => {
                            res.status(500).send('Error during transaction commit.');
                        });
                    }
                    console.log(`Message with ID ${messageId} and associated replies deleted successfully.`);
                    res.status(200).send({ status: 'ok', message: 'Message and associated replies deleted successfully' });
                });
            });
        });
    });
});




app.post('/channels/:channelId/messages', async (req, res) => {
    const { title, message, userId, channelId, ssId } = req.body; // Use ssId directly

    // Insert into 'messages' table
    const messageQuery = `INSERT INTO messages (title, text, user_id, channelID, ssID) VALUES (?, ?, ?, ?, ?)`;
    const queryParams = [title, message, userId, channelId, ssId || null]; // Use NULL if ssId is not provided

    connection.query(messageQuery, queryParams, (messageError, messageResult) => {
        if (messageError) {
            console.error('Error adding message:', messageError.message);
            return res.status(500).send('Error adding message.');
        }
        res.status(201).send({ status: 'ok', messageId: messageResult.insertId });
    });
});

app.post('/channels/:messageId/reply', async (req, res) => {
    const { text, userId, messageId } = req.body; // Extract needed data from request body
    const messageID = parseInt(messageId);
    console.log({ text, userId, messageID });
    const replyQuery = `INSERT INTO reply (text, user_id, messageID) VALUES (?, ?, ?)`;
    connection.query(replyQuery, [text, userId, messageID], (replyError, replyResult) => {
        if (replyError) {
            console.error('Error adding reply:', replyError.message);
            return res.status(500).send('Error adding reply.');
        }
        res.status(201).send({ status: 'ok', replyId: replyResult.insertId });
    });
});

app.post('/upload', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const url = `http://localhost:8080/uploads/${req.file.filename}`;

    // Insert into 'ss' table
    connection.query('INSERT INTO ss (url) VALUES (?)', [url], function (error, results) {
        if (error) {
            console.error('Error saving screenshot URL:', error);
            return res.status(500).send('Error saving screenshot.');
        }
        res.status(201).send({ imageUrl: url, ssId: results.insertId });
    });
});


app.post('/reply/:replyId/upvote', async (req, res) => {
    const { replyId } = req.params;
    const { userId } = req.body;
    console.log("Received userId for upvote:", userId);
    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // First, check if the user already voted
        connection.query('SELECT * FROM reply_votes WHERE user_id = ? AND reply_id = ?', [userId, replyId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length > 0) {
                // User has already voted, so don't allow another vote
                return res.status(400).send({ status: 'error', message: 'User has already voted' });
            } else {
                // Insert vote record
                connection.query('INSERT INTO reply_votes (user_id, reply_id, voteType) VALUES (?, ?, "up")', [userId, replyId], (error, result) => {
                    if (error) {
                        console.error('Error inserting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error inserting vote.');
                        });
                    }

                    // Update vote count in reply table
                    connection.query('UPDATE reply SET upVote = upVote + 1 WHERE id = ?', [replyId], (error, result) => {
                        if (error) {
                            console.error('Error updating upvote count:', error.message);
                            return connection.rollback(() => {
                                res.status(500).send('Error updating upvote count.');
                            });
                        }

                        // Commit the transaction
                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Upvote successful' });
                        });
                    });
                });
            }
        });
    });
});
app.post('/reply/:replyId/downvote', async (req, res) => {
    const { replyId } = req.params;
    const { userId } = req.body;

    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // First, check if the user has already voted
        connection.query('SELECT * FROM reply_votes WHERE user_id = ? AND reply_id = ?', [userId, replyId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length > 0) {
                // User has already voted, so don't allow another vote
                return res.status(400).send({ status: 'error', message: 'User has already voted' });
            } else {
                // Insert vote record
                connection.query('INSERT INTO reply_votes (user_id, reply_id, voteType) VALUES (?, ?, "down")', [userId, replyId], (error, result) => {
                    if (error) {
                        console.error('Error inserting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error inserting vote.');
                        });
                    }

                    // Update vote count in reply table
                    connection.query('UPDATE reply SET downVote = downVote + 1 WHERE id = ?', [replyId], (error, result) => {
                        if (error) {
                            console.error('Error updating downvote count:', error.message);
                            return connection.rollback(() => {
                                res.status(500).send('Error updating downvote count.');
                            });
                        }

                        // Commit the transaction
                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Downvote successful' });
                        });
                    });
                });
            }
        });
    });
});
app.post('/reply/:replyId/unvote', async (req, res) => {
    const { replyId } = req.params;
    const { userId } = req.body;

    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // First, check if the user has voted
        connection.query('SELECT * FROM reply_votes WHERE user_id = ? AND reply_id = ?', [userId, replyId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length === 0) {
                // User hasn't voted, so can't unvote
                return res.status(400).send({ status: 'error', message: 'User has not voted yet' });
            } else {
                // Get the type of vote to reverse it in the `reply` table
                const voteType = results[0].voteType;

                // Delete the vote record
                connection.query('DELETE FROM reply_votes WHERE user_id = ? AND reply_id = ?', [userId, replyId], (error, result) => {
                    if (error) {
                        console.error('Error deleting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error deleting vote.');
                        });
                    }

                    // Update vote count in reply table based on voteType
                    let updateVoteQuery = '';
                    if (voteType === 'up') {
                        updateVoteQuery = 'UPDATE reply SET upVote = upVote - 1 WHERE id = ?';
                    } else if (voteType === 'down') {
                        updateVoteQuery = 'UPDATE reply SET downVote = downVote - 1 WHERE id = ?';
                    }

                    connection.query(updateVoteQuery, [replyId], (error, result) => {
                        if (error) {
                            console.error('Error updating vote count:', error.message);
                            return connection.rollback(() => {
                                res.status(500).send('Error updating vote count.');
                            });
                        }

                        // Commit the transaction
                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Unvote successful' });
                        });
                    });
                });
            }
        });
    });
});
app.post('/message/:messageId/upvote', async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req.body;
    console.log("messageId:", messageId, "userId:", userId);
    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // Check if the user already voted
        connection.query('SELECT * FROM message_votes WHERE user_id = ? AND message_id = ?', [userId, messageId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length > 0) {
                return res.status(400).send({ status: 'error', message: 'User has already voted' });
            } else {
                // Insert vote record
                connection.query('INSERT INTO message_votes (user_id, message_id, voteType) VALUES (?, ?, "up")', [userId, messageId], (error, result) => {
                    if (error) {
                        console.error('Error inserting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error inserting vote.');
                        });
                    }

                    // Update vote count in messages table
                    connection.query('UPDATE messages SET upVote = upVote + 1 WHERE id = ?', [messageId], (error, result) => {
                        if (error) {
                            console.error('Error updating upvote count:', error.message);
                            return connection.rollback(() => {
                                res.status(500).send('Error updating upvote count.');
                            });
                        }

                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Upvote successful' });
                        });
                    });
                });
            }
        });
    });
});
app.post('/message/:messageId/downvote', async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req.body;

    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // Check if the user already voted
        connection.query('SELECT * FROM message_votes WHERE user_id = ? AND message_id = ?', [userId, messageId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length > 0) {
                return res.status(400).send({ status: 'error', message: 'User has already voted' });
            } else {
                // Insert vote record for downvote
                connection.query('INSERT INTO message_votes (user_id, message_id, voteType) VALUES (?, ?, "down")', [userId, messageId], (error, result) => {
                    if (error) {
                        console.error('Error inserting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error inserting vote.');
                        });
                    }

                    // Update downvote count in messages table
                    connection.query('UPDATE messages SET downVote = downVote + 1 WHERE id = ?', [messageId], (error, result) => {
                        if (error) {
                            console.error('Error updating downvote count:', error.message);
                            return connection.rollback(() => {
                                res.status(500).send('Error updating downvote count.');
                            });
                        }

                        // Commit the transaction
                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Downvote successful' });
                        });
                    });
                });
            }
        });
    });
});

app.post('/message/:messageId/unvote', async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req.body;

    // Begin transaction
    connection.beginTransaction(error => {
        if (error) {
            console.error('Transaction Begin Error:', error);
            return res.status(500).send('Error beginning transaction.');
        }

        // First, check if the user has voted
        connection.query('SELECT voteType FROM message_votes WHERE user_id = ? AND message_id = ?', [userId, messageId], (error, results) => {
            if (error) {
                console.error('Error checking vote:', error.message);
                return connection.rollback(() => {
                    res.status(500).send('Error checking vote.');
                });
            }

            if (results.length === 0) {
                return res.status(400).send({ status: 'error', message: 'User has not voted' });
            } else {
                // Determine whether it was an upvote or downvote
                const voteType = results[0].voteType;

                // Delete the vote record
                connection.query('DELETE FROM message_votes WHERE user_id = ? AND message_id = ?', [userId, messageId], (error, result) => {
                    if (error) {
                        console.error('Error deleting vote:', error.message);
                        return connection.rollback(() => {
                            res.status(500).send('Error deleting vote.');
                        });
                    }

                    // Update vote count in messages table
                    let updateVoteQuery = voteType === 'up'
                        ? 'UPDATE messages SET upVote = upVote - 1 WHERE id = ?'
                        : 'UPDATE messages SET downVote = downVote - 1 WHERE id = ?';

                    connection.query(updateVoteQuery, [messageId], (error, result) => {
                        if (error) {
                            console.error(`Error updating ${voteType}vote count:`, error.message);
                            return connection.rollback(() => {
                                res.status(500).send(`Error updating ${voteType}vote count.`);
                            });
                        }

                        // Commit the transaction
                        connection.commit(err => {
                            if (err) {
                                console.error('Transaction Commit Error:', err);
                                return connection.rollback(() => {
                                    res.status(500).send('Error during transaction commit.');
                                });
                            }
                            res.status(200).send({ status: 'ok', message: 'Unvote successful' });
                        });
                    });
                });
            }
        });
    });
});


app.get('/', (req, res) => {
    res.sendFile('startDatabase.html', { root: __dirname });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
