local json = require("json")
local ao = require("ao")
local sqlite3 = require("lsqlite3")

-- Open the database
local db = db or sqlite3.open_memory()

-- Function to Initialize the Database
function InitDb(schema_sql)
    db:exec(schema_sql)
    return "Script executed"
end
  
local function insert_into_outbox(outbox_id, user_id, recipient_id, message)
    local stmt = db:prepare("INSERT INTO UserOutbox (outbox_id, user_id, recipient_id, message) VALUES (?, ?, ?, ?)")
    if stmt then
        stmt:bind_values(outbox_id, user_id, recipient_id, message)
        stmt:step()
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end
end

local function insert_into_inbox(inbox_id, user_id, sender_id, message)
    local stmt = db:prepare("INSERT INTO UserInbox (inbox_id, user_id, sender_id, message) VALUES (?, ?, ?, ?)")
    if stmt then
        stmt:bind_values(inbox_id, user_id, sender_id, message)
        stmt:step()
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end
end

local function insert_into_replies(reply_id, inbox_id, user_id, recipient_id, message)
    local stmt = db:prepare("INSERT INTO UserReplies (reply_id, inbox_id, user_id, recipient_id, message) VALUES (?, ?, ?, ?, ?)")
    if stmt then
        stmt:bind_values(reply_id, inbox_id, user_id, recipient_id, message)
        stmt:step()
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end
end

local function get_outbox_page(user_id, page, page_size)
    local offset = (page - 1) * page_size
    local stmt = db:prepare("SELECT outbox_id, recipient_id, message, sent_at FROM UserOutbox WHERE user_id = ? LIMIT ? OFFSET ?")
    local total_stmt = db:prepare("SELECT COUNT(*) as total FROM UserOutbox WHERE user_id = ?")
    local result = { page = page, total_size = 0, messages = {} }

    if stmt and total_stmt then
        total_stmt:bind_values(user_id)
        for row in total_stmt:nrows() do
            result.total_size = row.total
        end
        total_stmt:finalize()

        stmt:bind_values(user_id, page_size, offset)
        for row in stmt:nrows() do
            table.insert(result.messages, {
                outbox_id = row.outbox_id,
                recipient_id = row.recipient_id,
                message = row.message,
                sent_at = row.sent_at
            })
        end
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end

    return json.encode(result)
end

local function get_replies_by_inbox_id(inbox_id)
    local stmt = db:prepare("SELECT reply_id, user_id, recipient_id, message, sent_at FROM UserReplies WHERE inbox_id = ?")
    local result = { inbox_id = inbox_id, replies = {} }

    if stmt then
        stmt:bind_values(inbox_id)
        for row in stmt:nrows() do
            table.insert(result.replies, {
                reply_id = row.reply_id,
                user_id = row.user_id,
                recipient_id = row.recipient_id,
                message = row.message,
                sent_at = row.sent_at
            })
        end
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end

    return json.encode(result)
end

local function get_inbox_page(user_id, page, page_size)
    local offset = (page - 1) * page_size
    local stmt = db:prepare("SELECT inbox_id, sender_id, message, received_at FROM UserInbox WHERE user_id = ? LIMIT ? OFFSET ?")
    local total_stmt = db:prepare("SELECT COUNT(*) as total FROM UserInbox WHERE user_id = ?")
    local result = { page = page, total_size = 0, messages = {} }

    if stmt and total_stmt then
        total_stmt:bind_values(user_id)
        for row in total_stmt:nrows() do
            result.total_size = row.total
        end
        total_stmt:finalize()

        stmt:bind_values(user_id, page_size, offset)
        for row in stmt:nrows() do
            table.insert(result.messages, {
                inbox_id = row.inbox_id,
                sender_id = row.sender_id,
                message = row.message,
                received_at = row.received_at
            })
        end
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end

    return json.encode(result)
end

-- Function to add a favorite user
local function add_favorite_user(favorite_id, user_id, favorite_user_id)
    local stmt = db:prepare([[
        INSERT INTO UserFavorites (favorite_id, user_id, favorite_user_id)
        VALUES (?, ?, ?)
    ]])
    stmt:bind_values(favorite_id, user_id, favorite_user_id)
    stmt:step()
    stmt:finalize()
    return favorite_id
end

-- Function to get favorite users for a user with pagination
local function get_favorite_users(user_id, page, page_size)
    local offset = (page - 1) * page_size
    local stmt = db:prepare([[
        SELECT favorite_id, favorite_user_id, created_at
        FROM UserFavorites
        WHERE user_id = ?
        LIMIT ? OFFSET ?
    ]])
    local total_stmt = db:prepare([[
        SELECT COUNT(*) as total
        FROM UserFavorites
        WHERE user_id = ?
    ]])
    local result = { page = page, total_size = 0, favorites = {} }

    if stmt and total_stmt then
        total_stmt:bind_values(user_id)
        for row in total_stmt:nrows() do
            result.total_size = row.total
        end
        total_stmt:finalize()

        stmt:bind_values(user_id, page_size, offset)
        for row in stmt:nrows() do
            table.insert(result.favorites, {
                favorite_id = row.favorite_id,
                favorite_user_id = row.favorite_user_id,
                created_at = row.created_at
            })
        end
        stmt:finalize()
    else
        error("Failed to prepare statement")
    end

    return json.encode(result)
end

-- Function to remove a favorite user
local function remove_favorite_user(favorite_id)
    local stmt = db:prepare([[
        DELETE FROM UserFavorites
        WHERE favorite_id = ?
    ]])
    stmt:bind_values(favorite_id)
    stmt:step()
    stmt:finalize()
end

-- Handler Definitions

-- InitDb Handler
Handlers.add(
    "InitDb",
    Handlers.utils.hasMatchingTag("Action", "InitDb"),
    function(msg)
        local resutl = InitDb(msg.Data)
        ao.send(
            {
                Target = msg.From,
                Data = result
            }
        )
    end
)

-- Define the InsertNodeScript handler
Handlers.add(
    "InsertNodeScript",
    Handlers.utils.hasMatchingTag("Action", "InsertNodeScript"),
    function(msg)
        -- Decode the incoming JSON message
        local script_data = json.decode(msg.Data)

        -- Call the InsertNodeScript function to insert or update the script
        local result = InsertNodeScript(
            msg.Id,
            script_data.node_type,
            script_data.script_name,
            script_data.script_version,
            script_data.script_content
        )

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = result
        })
    end
)

-- Define the InsertOutboxMessage handler
Handlers.add(
    "InsertOutboxMessage",
    Handlers.utils.hasMatchingTag("Action", "InsertOutboxMessage"),
    function(msg)
        -- Decode the incoming JSON message
        local message_data = json.decode(msg.Data)

        -- Call the insert_into_outbox function to insert the message
        insert_into_outbox(
            message_data.outbox_id,
            message_data.user_id,
            message_data.recipient_id,
            message_data.message
        )

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode({ status = "success" })
        })
    end
)

-- Define the InsertInboxMessage handler    
Handlers.add(
    "InsertInboxMessage",
    Handlers.utils.hasMatchingTag("Action", "InsertInboxMessage"),
    function(msg)
        -- Decode the incoming JSON message
        local message_data = json.decode(msg.Data)

        -- Call the insert_into_inbox function to insert the message
        insert_into_inbox(
            message_data.inbox_id,
            message_data.user_id,
            message_data.sender_id,
            message_data.message
        )

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode({ status = "success" })
        })
    end
)

-- Define the InsertReplyMessage handler    
Handlers.add(
    "InsertReplyMessage",
    Handlers.utils.hasMatchingTag("Action", "InsertReplyMessage"),
    function(msg)
        -- Decode the incoming JSON message
        local message_data = json.decode(msg.Data)

        -- Call the insert_into_replies function to insert the message
        insert_into_replies(
            message_data.reply_id,
            message_data.inbox_id,
            message_data.user_id,
            message_data.recipient_id,
            message_data.message
        )

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode({ status = "success" })
        })
    end
)

-- Define the GetOutboxPage handler 
Handlers.add(
    "GetOutboxPage",
    Handlers.utils.hasMatchingTag("Action", "GetOutboxPage"),
    function(msg)
        -- Decode the incoming JSON message
        local page_data = json.decode(msg.Data)

        -- Call the get_outbox_page function to retrieve the outbox messages
        local outbox_result = json.decode(get_outbox_page(
            page_data.user_id,
            page_data.page,
            page_data.page_size
        ))

        -- For each outbox message, get the replies
        for _, message in ipairs(outbox_result.messages) do
            local replies_result = json.decode(get_replies_by_inbox_id(message.outbox_id))
            message.replies = replies_result
        end

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode(outbox_result)
        })
    end
)

-- Define the GetInboxPage handler
Handlers.add(
    "GetInboxPage",
    Handlers.utils.hasMatchingTag("Action", "GetInboxPage"),
    function(msg)
        -- Decode the incoming JSON message
        local page_data = json.decode(msg.Data)

        -- Call the get_inbox_page function to retrieve the inbox messages
        local result = json.decode(get_inbox_page(
            page_data.user_id,
            page_data.page,
            page_data.page_size
        ))

        -- For each outbox message, get the replies
        for _, message in ipairs(result.messages) do
            local replies_result = json.decode(get_replies_by_inbox_id(message.inbox_id))
            message.replies = replies_result
        end
        
        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode(result)
        })
    end
)

-- AddFavoriteUser Handler
Handlers.add(
    "AddFavoriteUser",
    Handlers.utils.hasMatchingTag("Action", "AddFavoriteUser"),
    function(msg)
        local data = json.decode(msg.Data)
        local favorite_id = add_favorite_user(data.favorite_id, data.user_id, data.favorite_user_id)
        ao.send({ Target = msg.From, Data = json.encode({ favorite_id = favorite_id }) })
    end
)

-- GetFavoriteUsers Handler with pagination
Handlers.add(
    "GetFavoriteUsers",
    Handlers.utils.hasMatchingTag("Action", "GetFavoriteUsers"),
    function(msg)
        local data = json.decode(msg.Data)
        local result = get_favorite_users(data.user_id, data.page, data.page_size)
        ao.send({ Target = msg.From, Data = result })
    end
)

-- RemoveFavoriteUser Handler
Handlers.add(
    "RemoveFavoriteUser",
    Handlers.utils.hasMatchingTag("Action", "RemoveFavoriteUser"),
    function(msg)
        local data = json.decode(msg.Data)
        remove_favorite_user(data.favorite_id)
        ao.send({ Target = msg.From, Data = "Favorite user removed" })
    end
)