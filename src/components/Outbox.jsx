const Outbox = ({ messages, outboxCurrentPage, outboxTotalPages, handleNextPage, handlePreviousPage }) => {
    const handleNext = () => {
      handleNextPage();
    };
  
    const handlePrevious = () => {
      handlePreviousPage();
    };
  
    return (
      <div>
        <h2>Outbox</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              To: {message.receiverId}, Message: {message.message}, Timestamp: {message.timestamp}
            </li>
          ))}
        </ul>
        <div>
          <button onClick={handlePrevious} disabled={outboxCurrentPage === 1}>
            Previous
          </button>
          <span>Page {outboxCurrentPage} of {outboxTotalPages}</span>
          <button onClick={handleNext} disabled={outboxCurrentPage === outboxTotalPages}>
            Next
          </button>
        </div>
      </div>
    );
  };
  
export default Outbox;
