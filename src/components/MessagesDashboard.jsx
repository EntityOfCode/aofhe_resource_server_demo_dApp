import Inbox from './Inbox';
import Outbox from './Outbox';

const MessagesDashboard = ({
    inboxMessages,
    inboxCurrentPage,
    inboxTotalPages,
    handleInboxNextPage,
    handleInboxPreviousPage,
    sendReply,
    outboxMessages,
    outboxCurrentPage,
    outboxTotalPages,
    handleOutboxNextPage,
    handleOutboxPreviousPage,
  }) => {
    return (
      <div className="bg-black text-white flex flex-col md:flex-row gap-4 p-4">
        {/* Inbox Component */}
        <div className="flex-1">
          <Inbox
            messages={inboxMessages}
            currentPage={inboxCurrentPage}
            totalPages={inboxTotalPages}
            handleNextPage={handleInboxNextPage}
            handlePreviousPage={handleInboxPreviousPage}
            sendReply={sendReply}
          />
        </div>
  
        {/* Outbox Component */}
        <div className="flex-1">
          <Outbox
            messages={outboxMessages}
            currentPage={outboxCurrentPage}
            totalPages={outboxTotalPages}
            handleNextPage={handleOutboxNextPage}
            handlePreviousPage={handleOutboxPreviousPage}
          />
        </div>
      </div>
    );
  };
  
  export default MessagesDashboard;
  