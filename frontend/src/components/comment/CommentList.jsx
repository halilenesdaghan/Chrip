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
  const handleDeleteComment = (comment_id) => {
    // Yorumun ana yorum mu yanıt mı olduğunu kontrol et
    const isMainComment = comments.includes(comment_id);
    
    if (isMainComment) {
      // Ana yorumu listeden kaldır
      setComments(prevComments => 
        prevComments.filter(id => id !== comment_id)
      );
      
      // Ana yorumun yanıtlarını da kaldır
      if (commentMap[comment_id]?.replies?.length) {
        const replyIds = commentMap[comment_id].replies;
        const newCommentMap = { ...commentMap };
        
        // Ana yorumu ve yanıtlarını haritadan kaldır
        delete newCommentMap[comment_id];
        replyIds.forEach(replyId => {
          delete newCommentMap[replyId];
        });
        
        setCommentMap(newCommentMap);
      } else {
        // Sadece ana yorumu kaldır
        const newCommentMap = { ...commentMap };
        delete newCommentMap[comment_id];
        setCommentMap(newCommentMap);
      }
    } else {
      // Yanıtı bul ve kaldır
      for (const parentId in commentMap) {
        if (commentMap[parentId].replies.includes(comment_id)) {
          // Yanıtı ana yorumun yanıtlar listesinden kaldır
          setCommentMap(prevMap => ({
            ...prevMap,
            [parentId]: {
              ...prevMap[parentId],
              replies: prevMap[parentId].replies.filter(id => id !== comment_id)
            }
          }));
          
          // Yanıtı haritadan kaldır
          setCommentMap(prevMap => {
            const newMap = { ...prevMap };
            delete newMap[comment_id];
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
      {/* Comments Mapped */}
      {comments.map(comment_id => {
        const comment = commentMap[comment_id];
        if (!comment) return null;
        
        return (
          <div key={comment_id}>
            {/* Ana yorum */}
            <CommentCard 
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
            
                        

            {/* Yanıtlar */}
            {showReplies && comment.latest_sub_comment !== null && (
              <div className="ml-12 mt-3 space-y-3">
                  <CommentCard
                    comment={comment.latest_sub_comment}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    isReply={true}
                  />
              </div>
            )}
            {/* Birden Fazla Yanıt var ise Tüm Yanıtları Göster Butonu */}
            {showReplies && comment.sub_comment_list.length > 1 && (
              <button className="mt-2 ml-12 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Tüm Yanıtları Göster
              </button>
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
      commented_on_id: PropTypes.string.isRequired,
      creator_id: PropTypes.string,
      content: PropTypes.string.isRequired,
      created_at: PropTypes.string,
      latest_sub_comment: PropTypes.oneOfType([
        PropTypes.shape({
          comment_id: PropTypes.string,
          commented_on_id: PropTypes.string,
          creator_id: PropTypes.string,
          content: PropTypes.string,
          created_at: PropTypes.string,
          photo_urls: PropTypes.arrayOf(PropTypes.string),
          like_count: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
          ]),
          dislike_count: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
          ]),
        }),
        PropTypes.oneOf([null])
      ])
    })
  ).isRequired,
  showReplies: PropTypes.bool
};

export default CommentList;