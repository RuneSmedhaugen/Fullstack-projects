const pool = require('../models/db');

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const { receiver_id } = req.body;
        const sender_id = req.user.id;

        if (sender_id === receiver_id) {
            return res.status(400).json({ message: "You can't send a request to yourself." });
        }
        console.log(`Friend request sent from ${sender_id} to ${receiver_id}`);

        const existingRequest = await pool.query(
            "SELECT * FROM notifications WHERE sender_id = $1 AND receiver_id = $2 AND type = 'friend_request' AND status = 'pending'",
            [sender_id, receiver_id]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ message: "Friend request already sent." });
        }

       
        await pool.query(
            "INSERT INTO notifications (sender_id, receiver_id, type, status) VALUES ($1, $2, 'friend_request', 'pending')",
            [sender_id, receiver_id]
        );

        res.status(201).json({ message: "Friend request sent!" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept or decline a friend request
exports.respondToFriendRequest = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { requestId, accept } = req.body;
        const user_id = req.user.id; // The user responding to the request

        console.log(`User ${user_id} is responding to friend request ${requestId} with accept ${accept}`);

        // Check if the notification exists
        const notification = await pool.query(
            "SELECT * FROM notifications WHERE id = $1 AND receiver_id = $2 AND type = 'friend_request' AND status = 'pending'",
            [requestId, user_id]
        );

        console.log(`Notification found: ${JSON.stringify(notification.rows)}`);

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        let newStatus;
        if (accept) {
            newStatus = "accepted";
            // Add to friends table (assuming a friends table exists)
            await pool.query(
                "INSERT INTO friends (user_id, friend_id, created_at) VALUES ($1, $2, NOW())",
                [notification.rows[0].sender_id, user_id]
            );
        } else {
            newStatus = "declined";
        }

        console.log(`Updating notification status to ${newStatus}`);

        // Update the notification status
        await pool.query(
            "UPDATE notifications SET status = $1 WHERE id = $2",
            [newStatus, requestId]
        );

        res.status(200).json({ message: `Friend request ${newStatus}.` });
    } catch (error) {
        console.error("Error responding to friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch friend requests for the logged-in user
exports.getFriendRequests = async (req, res) => {
    try {
        const user_id = req.user.id; // Get logged-in user ID

        const requests = await pool.query(
            `SELECT notifications.id, notifications.sender_id, notifications.receiver_id, notifications.type, notifications.status, notifications.created_at, users.username AS sender_username
             FROM notifications
             JOIN users ON notifications.sender_id = users.id
             WHERE notifications.receiver_id = $1 AND notifications.type = 'friend_request' AND notifications.status = 'pending'
             ORDER BY notifications.created_at DESC`,
            [user_id]
        );

        res.status(200).json(requests.rows);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};