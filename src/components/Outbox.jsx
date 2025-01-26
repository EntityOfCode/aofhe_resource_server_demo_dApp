const Outbox = ({ messages, currentPage, totalPages, handleNextPage, handlePreviousPage }) => {
    const handleNext = () => {
      handleNextPage();
    };
  
    const handlePrevious = () => {
      handlePreviousPage();
    };
  
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
  
    return (
      <div className="flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-xl font-bold mb-4">Outbox</h2>
        <ul className="w-full max-w-2xl space-y-2">
          {messages.map((message, index) => (
            <li key={index} className="border-b border-gray-700 pb-2">
              <div className="text-sm">
                <p><strong>To:</strong> {message.receiverId}</p>
                <p><strong>Message:</strong> {message.plainMessage}</p>
                <p className="text-gray-500"><strong>Timestamp:</strong> {formatDate(message.timestamp)}</p>
                {message.replies.replies.length > 0 && (
                  <p className="text-gray-300"><strong>Reply:</strong> {message.replies.replies[0].plainMessage}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center w-full max-w-2xl mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };
  
  export default Outbox;
  