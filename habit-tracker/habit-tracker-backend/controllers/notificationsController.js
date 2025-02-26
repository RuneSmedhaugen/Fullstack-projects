const pool = require('../models/db');

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const { receiver_id } = req.body;
        const sender_id = req.user.id; // Assuming req.user is set after authentication

        if (sender_id === receiver_id) {
            return res.status(400).json({ message: "You can't send a request to yourself." });
        }

        // Check if a request already exists
        const existingRequest = await pool.query(
            "SELECT * FROM notifications WHERE sender_id = $1 AND receiver_id = $2 AND type = 'friend_request' AND status = 'pending'",
            [sender_id, receiver_id]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ message: "Friend request already sent." });
        }

        // Insert the friend request into the notifications table
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
        const { notification_id, action } = req.body;
        const user_id = req.user.id; // The user responding to the request

        // Check if the notification exists
        const notification = await pool.query(
            "SELECT * FROM notifications WHERE id = $1 AND receiver_id = $2 AND type = 'friend_request' AND status = 'pending'",
            [notification_id, user_id]
        );

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        let newStatus;
        if (action === "accept") {
            newStatus = "accepted";
            // Add to friends table (assuming a friends table exists)
            await pool.query(
                "INSERT INTO friends (user_id1, user_id2) VALUES ($1, $2)",
                [notification.rows[0].sender_id, user_id]
            );
        } else if (action === "decline") {
            newStatus = "declined";
        } else {
            return res.status(400).json({ message: "Invalid action." });
        }

        // Update the notification status
        await pool.query(
            "UPDATE notifications SET status = $1 WHERE id = $2",
            [newStatus, notification_id]
        );

        res.status(200).json({ message: `Friend request ${newStatus}.` });
    } catch (error) {
        console.error("Error responding to friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch notifications for the logged-in user
exports.getUserNotifications = async (req, res) => {
    try {
        const user_id = req.user.id; // Get logged-in user ID

        const notifications = await pool.query(
            "SELECT * FROM notifications WHERE receiver_id = $1 ORDER BY created_at DESC",
            [user_id]
        );

        res.status(200).json(notifications.rows);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark notification as seen
exports.markNotificationAsSeen = async (req, res) => {
    try {
        const { notification_id } = req.body;
        const user_id = req.user.id;

        // Ensure the notification belongs to the user
        const notification = await pool.query(
            "SELECT * FROM notifications WHERE id = $1 AND receiver_id = $2",
            [notification_id, user_id]
        );

        if (notification.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found." });
        }

        // Update the notification status to 'seen'
        await pool.query(
            "UPDATE notifications SET status = 'seen' WHERE id = $1",
            [notification_id]
        );

        res.status(200).json({ message: "Notification marked as seen." });
    } catch (error) {
        console.error("Error marking notification as seen:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
