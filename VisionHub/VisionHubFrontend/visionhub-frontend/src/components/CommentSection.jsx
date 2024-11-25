import React from 'react';

const CommentSection = ({ comments, commentText, setCommentText, handleCommentSubmit, isDarkMode }) => {
    return (
        <div className="comments-section">
            <h3>Comments</h3>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        <p><strong>{comment.username}:</strong> {comment.commentText}</p>
                        <p className="comment-date">{new Date(comment.commentDate).toLocaleString()}</p>
                    </li>
                ))}
            </ul>

            <div className="comment-input">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                ></textarea>
                <button onClick={handleCommentSubmit}>Submit</button>
            </div>
        </div>
    );
};

export default CommentSection;
