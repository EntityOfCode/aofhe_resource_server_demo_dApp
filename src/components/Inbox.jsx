const Inbox = ({ messages, inboxCurrentPage, inboxTotalPages, handleNextPage, handlePreviousPage }) => {
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
            From: {message.senderId}, Message: {message.message}, Timestamp: {message.timestamp}
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