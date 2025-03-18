import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CommentCard from './CommentCard';

const CommentList = ({ comments: initialComments, showReplies = true }) => {
  const [comments, setComments] = useState([]);
  const [commentMap, setCommentMap] = useState({});
  
  // Yorumları işle ve ana yorumlar ile yanıtları ayır
  useEffect(() => {
    if (!initialComments || !initialComments.length) {
      setComments([]);
      setCommentMap({});
      return;
    }
    
    const mainComments = [];
    const commentMappings = {};
    
    // Önce tüm yorumları haritala
    initialComments.forEach(comment => {
      commentMappings[comment.comment_id] = {
        ...comment,
        replies: []
      };
    });
    
    // Sonra ana yorumları ve yanıtlarını ayır
    initialComments.forEach(comment => {
      if (!comment.ust_yorum_id) {
        // Ana yorum
        mainComments.push(comment.comment_id);
      } else {
        // Yanıt
        if (commentMappings[comment.ust_yorum_id]) {
          commentMappings[comment.ust_yorum_id].replies.push(comment.comment_id);
        }
      }
    });
    
    setComments(mainComments);
    setCommentMap(commentMappings);
  }, [initialComments]);
  
  // Yorumu güncelle
  const handleUpdateComment = (updatedComment) => {
    setCommentMap(prevMap => ({
      ...prevMap,
      [updatedComment.comment_id]: {
        ...prevMap[updatedComment.comment_id],
        ...updatedComment
      }
    }));
  };
  
  // Yorumu sil
  const handleDeleteComment = (commentId) => {
    // Yorumun ana yorum mu yanıt mı olduğunu kontrol et
    const isMainComment = comments.includes(commentId);
    
    if (isMainComment) {
      // Ana yorumu listeden kaldır
      setComments(prevComments => 
        prevComments.filter(id => id !== commentId)
      );
      
      // Ana yorumun yanıtlarını da kaldır
      if (commentMap[commentId]?.replies?.length) {
        const replyIds = commentMap[commentId].replies;
        const newCommentMap = { ...commentMap };
        
        // Ana yorumu ve yanıtlarını haritadan kaldır
        delete newCommentMap[commentId];
        replyIds.forEach(replyId => {
          delete newCommentMap[replyId];
        });
        
        setCommentMap(newCommentMap);
      } else {
        // Sadece ana yorumu kaldır
        const newCommentMap = { ...commentMap };
        delete newCommentMap[commentId];
        setCommentMap(newCommentMap);
      }
    } else {
      // Yanıtı bul ve kaldır
      for (const parentId in commentMap) {
        if (commentMap[parentId].replies.includes(commentId)) {
          // Yanıtı ana yorumun yanıtlar listesinden kaldır
          setCommentMap(prevMap => ({
            ...prevMap,
            [parentId]: {
              ...prevMap[parentId],
              replies: prevMap[parentId].replies.filter(id => id !== commentId)
            }
          }));
          
          // Yanıtı haritadan kaldır
          setCommentMap(prevMap => {
            const newMap = { ...prevMap };
            delete newMap[commentId];
            return newMap;
          });
          
          break;
        }
      }
    }
  };

  // Yorumlar boşsa
  if (!comments.length) {
    return <p className="text-gray-500 text-center">Henüz yorum yok.</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map(commentId => {
        const comment = commentMap[commentId];
        if (!comment) return null;
        
        return (
          <div key={commentId}>
            {/* Ana yorum */}
            <CommentCard 
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
            
            {/* Yanıtlar */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 mt-3 space-y-3">
                {comment.replies.map(replyId => {
                  const reply = commentMap[replyId];
                  if (!reply) return null;
                  
                  return (
                    <CommentCard 
                      key={replyId}
                      comment={reply}
                      onUpdate={handleUpdateComment}
                      onDelete={handleDeleteComment}
                      showReplyForm={false}
                      isReply={true}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

CommentList.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      comment_id: PropTypes.string.isRequired,
      forum_id: PropTypes.string.isRequired,
      acan_kisi_id: PropTypes.string,
      icerik: PropTypes.string.isRequired,
      acilis_tarihi: PropTypes.string,
      ust_yorum_id: PropTypes.string
    })
  ).isRequired,
  showReplies: PropTypes.bool
};

export default CommentList;