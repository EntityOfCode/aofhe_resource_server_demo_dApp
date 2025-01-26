const Inbox = ({ messages, inboxCurrentPage, inboxTotalPages, handleNextPage, handlePreviousPage, sendReply }) => {
  const handleNext = () => {
    handleNextPage();
  };

  const handlePrevious = () => {
    handlePreviousPage();
  };

  return (
    <div>
      <h2>Inbox</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            From: {message.senderId}, Message: {message.plainMessage}, Timestamp: {message.timestamp},
            {message.replies.replies.length > 0 ? (
              <>
                , Reply: {message.replies.replies[0].plainMessage}
              </>
            ) : (
              <>
                <button onClick={() => sendReply(message)} className="bg-sky-600 text-white py-2 px-4 rounded">
                  Reply
                </button>
              </>
            )}

          </li>
        ))}
      </ul>
      <div>
        <button onClick={handlePrevious} disabled={inboxCurrentPage === 1}>
          Previous
        </button>
        <span>Page {inboxCurrentPage} of {inboxTotalPages}</span>
        <button onClick={handleNext} disabled={inboxCurrentPage === inboxTotalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Inbox;