// function organizeReplies(replies) {
//     const replyMap = {};
//
//     // First, create a map of all replies by their ID
//     replies.forEach(reply => {
//         replyMap[reply.id] = {...reply, replies: []};
//     });
//
//     // Then, go through the replies again to nest them appropriately
//     replies.forEach(reply => {
//         if (reply.parent_id) {
//             replyMap[reply.parent_id].replies.push(replyMap[reply.id]);
//         }
//     });
//
//     // Finally, filter out only the top-level replies (those without a parent_id)
//     return replies.filter(reply => !reply.parent_id).map(reply => replyMap[reply.id]);
// }
// export default organizeReplies;