local json = require("json")
local ao = require("ao")
local sqlite3 = require("lsqlite3")

-- Open the database
local db = db or sqlite3.open_memory()

-- Nodes Table Definition
NODES = [[
  CREATE TABLE IF NOT EXISTS Nodes (
    node_id TEXT PRIMARY KEY,    -- String ID
    node_type TEXT NOT NULL,     -- Type of node (main, client, respondent)
    node_status TEXT NOT NULL,   -- Status of the node (e.g., active, inactive)
    node_version TEXT NOT NULL,  -- Version of the node's schema
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
]]

-- Users Table Definition
USERS = [[
  CREATE TABLE IF NOT EXISTS Users (
    user_id TEXT PRIMARY KEY,    -- String ID
    data_node_id TEXT NOT NULL,         -- Associated SQL node ID (not enforced with a foreign key in distributed setup)
    crypto_node_id TEXT NOT NULL,         -- Associated FHE node ID (not enforced with a foreign key in distributed setup)
    nickname TEXT,
    schema_version TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
]]

-- UserOutbox Table Definition
USER_OUTBOX = [[
    CREATE TABLE IF NOT EXISTS UserOutbox (
        outbox_id TEXT PRIMARY KEY,    -- String ID
        user_id TEXT NOT NULL,         -- Associated user ID
        recipient_id TEXT NOT NULL,    -- ID of the recipient
        message TEXT NOT NULL,         -- Message content
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
]]

-- UserInbox Table Definition
USER_INBOX = [[
    CREATE TABLE IF NOT EXISTS UserInbox (
        inbox_id TEXT PRIMARY KEY,    -- String ID
        user_id TEXT NOT NULL,        -- Associated user ID
        sender_id TEXT NOT NULL,      -- ID of the sender
        message TEXT NOT NULL,        -- Message content
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
]]

-- UserReplies Table Definition
USER_REPLIES = [[
    CREATE TABLE IF NOT EXISTS UserReplies (
        reply_id TEXT PRIMARY KEY,    -- String ID
        inbox_id TEXT NOT NULL,       -- Associated inbox ID
        user_id TEXT NOT NULL,        -- Associated user ID
        recipient_id TEXT NOT NULL,   -- ID of the recipient
        message TEXT NOT NULL,        -- Message content
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
]]

-- SchemaManagement Table Definition
SCHEMA_MANAGEMENT = [[
  CREATE TABLE IF NOT EXISTS SchemaManagement (
    schema_id TEXT PRIMARY KEY,     -- String ID
    schema_version TEXT NOT NULL,   -- Version of the schema
    node_type TEXT NOT NULL,        -- Type of node (e.g., "client", "respondent")
    schema_sql TEXT NOT NULL,       -- SQL that defines the schema
    description TEXT,               -- Description of the schema update
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
]]

-- NodeScripts Table Definition
NODE_SCRIPTS = [[
  CREATE TABLE IF NOT EXISTS NodeScripts (
    script_id TEXT PRIMARY KEY,    -- String ID
    node_type TEXT NOT NULL,       -- Node type (client/respondent)
    script_name TEXT NOT NULL,     -- Name of the script
    script_version TEXT NOT NULL,  -- Version of the script
    script_content TEXT NOT NULL,  -- The Lua script content
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
]]

-- Function to Initialize the Database
function InitDb()
    local initial_orchestrator_schema_sql = NODES .. USERS .. SCHEMA_MANAGEMENT .. NODE_SCRIPTS
    db:exec(initial_orchestrator_schema_sql)
    InsertSchemaManagement("init_orchestrator_node", "v1.0", "orchestrator", initial_orchestrator_schema_sql, "Initial schema for orchestrator AO process")
  
    local initial_user_schema_sql = USER_OUTBOX .. USER_INBOX .. USER_REPLIES
    InsertSchemaManagement("init_user_node", "v1.0", "user", initial_user_schema_sql, "Initial schema for user AO process")       
end
    
-- Function to create a node
function CreateNode(node_id, node_type, node_status, node_version)
    local stmt = db:prepare([[
        INSERT INTO Nodes (node_id, node_type, node_status, node_version)
        VALUES (?, ?, ?, ?)
    ]])
    stmt:bind_values(node_id, node_type, node_status, node_version)
    stmt:step()
    stmt:finalize()
end

-- Function to create a user
function CreateUser(user_id, data_node_id, crypto_node_id, schema_version)
    local stmt = db:prepare([[
        INSERT INTO Users (user_id, data_node_id, crypto_node_id, schema_version)
        VALUES (?, ?, ?, ?)
    ]])
    stmt:bind_values(user_id, data_node_id, crypto_node_id, schema_version)
    stmt:step()
    stmt:finalize()
end

-- Function to register a user's nickname
function RegisterUserNickname(user_id, nickname)
    local stmt = db:prepare([[
        UPDATE Users
        SET nickname = ?
        WHERE user_id = ?
    ]])
    stmt:bind_values(nickname, user_id)
    stmt:step()
    stmt:finalize()
end

-- Function to get user data by user_id
function GetUserDataById(user_id)
    local stmt = db:prepare([[
        SELECT user_id, data_node_id, crypto_node_id, nickname, schema_version, created_at
        FROM Users
        WHERE user_id = ?
    ]])
    stmt:bind_values(user_id)
    local result = stmt:step()
    
    -- Initialize the user data structure
    local user_data = {}
    
    -- If a result is found, populate the user_data table
    if result == sqlite3.ROW then
        user_data = {
            user_id = stmt:get_value(0),
            data_node_id = stmt:get_value(1),
            crypto_node_id = stmt:get_value(2),
            nickname = stmt:get_value(3),
            schema_version = stmt:get_value(4),
            created_at = stmt:get_value(5)
        }
    end
    
    stmt:finalize()
    
    -- Return the user data if found, or return nil
    return user_data
end

-- Function to get a page of users excluding the current user
function GetUserPage(current_user_id, page, page_size)
    local offset = (page - 1) * page_size
    local stmt = db:prepare([[
        SELECT user_id, data_node_id, crypto_node_id, nickname, schema_version, created_at
        FROM Users
        WHERE user_id != ?
        LIMIT ? OFFSET ?
    ]])
    stmt:bind_values(current_user_id, page_size, offset)
    
    local users = {}
    for row in stmt:nrows() do
        table.insert(users, row)
    end
    stmt:finalize()
    
    -- Get the total number of users excluding the current user
    local count_stmt = db:prepare([[
        SELECT COUNT(*)
        FROM Users
        WHERE user_id != ?
    ]])
    count_stmt:bind_values(current_user_id)
    count_stmt:step()
    local total_size = count_stmt:get_value(0)
    count_stmt:finalize()
    
    return {
        users = users,
        total_size = total_size,
        page = page,
        page_size = page_size
    }
end

 
-- Function to insert schema management record
function InsertSchemaManagement(schema_id, schema_version, node_type, schema_sql, description)
    local stmt = db:prepare([[
        INSERT INTO SchemaManagement (schema_id, schema_version, node_type, schema_sql, description)
        VALUES (?, ?, ?, ?, ?)
    ]])
    stmt:bind_values(schema_id, schema_version, node_type, schema_sql, description)
    stmt:step()
    stmt:finalize()
end

-- Function to get the latest schema management record for a node type
function GetLatestSchemaManagement(node_type)
    local stmt = db:prepare([[
        SELECT * FROM SchemaManagement
        WHERE node_type = ?
        ORDER BY schema_version DESC
        LIMIT 1
    ]])
    stmt:bind_values(node_type)
    local result = stmt:step()
    local schema = {}
  
    if result == sqlite3.ROW then
        schema = {
            schema_id = stmt:get_value(0),
            schema_version = stmt:get_value(1),
            node_type = stmt:get_value(2),
            schema_sql = stmt:get_value(3),
            description = stmt:get_value(4),
            applied_at = stmt:get_value(5)
        }
    end
  
    stmt:finalize()
    return schema
end

-- Function to insert or update a node script in the NodeScripts table
function InsertNodeScript(script_id, node_type, script_name, script_version, script_content)
    -- First, check if a script with the same node_type and script_name already exists
    local stmt = db:prepare([[
        SELECT COUNT(*) FROM NodeScripts WHERE node_type = ? AND script_name = ?
    ]])
    stmt:bind_values(node_type, script_name)
    local result = stmt:step()
    local count = stmt:get_value(0)
    stmt:finalize()
  
    if count > 0 then
        -- If the script exists, update the existing record
        local update_stmt = db:prepare([[
            UPDATE NodeScripts 
            SET script_version = ?, script_content = ?, created_at = CURRENT_TIMESTAMP 
            WHERE node_type = ? AND script_name = ?
        ]])
        update_stmt:bind_values(script_version, script_content, node_type, script_name)
        update_stmt:step()
        update_stmt:finalize()
        return "Script updated"
    else
        -- If the script does not exist, insert a new record
        local insert_stmt = db:prepare([[
            INSERT INTO NodeScripts (script_id, node_type, script_name, script_version, script_content) 
            VALUES (?, ?, ?, ?, ?)
        ]])
        insert_stmt:bind_values(script_id, node_type, script_name, script_version, script_content)
        insert_stmt:step()
        insert_stmt:finalize()
        return "Script inserted"
    end
end
  
  -- Function to get the latest node script by node_type
function GetLatestNodeScript(node_type)
    -- Query to get the latest script for the given node_type by the latest version
    local stmt = db:prepare([[
        SELECT script_id, script_name, script_version, script_content 
        FROM NodeScripts 
        WHERE node_type = ?
        ORDER BY script_version DESC
        LIMIT 1
    ]])
    stmt:bind_values(node_type)
    local result = stmt:step()
  
    -- Initialize the script data structure
    local script_data = {}
  
    -- If a result is found, populate the script_data table
    if result == sqlite3.ROW then
        script_data = {
            script_id = stmt:get_value(0),
            script_name = stmt:get_value(1),
            script_version = stmt:get_value(2),
            script_content = stmt:get_value(3)
        }
    end
  
    stmt:finalize()
  
    -- Return the script data if found, or return nil
    return script_data
end

InitDb()

-- Handler Definitions

-- InsertSchemaManagement Handler: Insert a schema management record
Handlers.add(
  "InsertSchemaManagement",
  Handlers.utils.hasMatchingTag("Action", "InsertSchemaManagement"),
  function(msg)
      local schema_data = json.decode(msg.Data)
      InsertSchemaManagement(
          schema_data.schema_id,
          schema_data.schema_version,
          schema_data.node_type,
          schema_data.schema_sql,
          schema_data.description
      )
      ao.send({ Target = msg.From, Data = "Schema management record inserted" })
  end
)

-- GetLatestSchemaManagement Handler: Get the latest schema for a node type
Handlers.add(
  "GetLatestSchemaManagement",
  Handlers.utils.hasMatchingTag("Action", "GetLatestSchemaManagement"),
  function(msg)
      local node_type = json.decode(msg.Data).node_type
      local schema = GetLatestSchemaManagement(node_type)
      ao.send({ Target = msg.From, Data = json.encode(schema) })
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

-- Define the GetLatestNodeScript handler
Handlers.add(
    "GetLatestNodeScript",
    Handlers.utils.hasMatchingTag("Action", "GetLatestNodeScript"),
    function(msg)
        -- Decode the incoming JSON message
        local script_request = json.decode(msg.Data)

        -- Call the GetLatestNodeScript function to fetch the latest script
        local script_data = GetLatestNodeScript(script_request.node_type)

        -- If a script is found, send it back; otherwise, send an error message
        if script_data and next(script_data) then
            ao.send({
                Target = msg.From,
                Data = json.encode(script_data)
            })
        else
            ao.send({
                Target = msg.From,
                Data = "No script found for node_type: " .. script_request.node_type
            })
        end
    end
)

-- Define the CreateUser handler
Handlers.add(
    "CreateUser",
    Handlers.utils.hasMatchingTag("Action", "CreateUser"),
    function(msg)
        -- Decode the incoming JSON message
        local user_data = json.decode(msg.Data)

        -- Create the data node
        local data_node_id = user_data.data_node_id
        CreateNode(data_node_id, "data", "active", "v1.0")

        -- Create the crypto node
        local crypto_node_id = user_data.crypto_node_id
        CreateNode(crypto_node_id, "crypto", "active", "v1.0")

        -- Create the user with the associated nodes
        CreateUser(
            user_data.user_id,
            user_data.data_node_id,
            user_data.crypto_node_id,
            user_data.schema_version
        )

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = "User created with data and crypto nodes"
        })
    end
)

-- Define the RegisterUserNickname handler
Handlers.add(
    "RegisterUserNickname",
    Handlers.utils.hasMatchingTag("Action", "RegisterUserNickname"),
    function(msg)
        -- Decode the incoming JSON message
        local nickname_data = json.decode(msg.Data)

        -- Register the user's nickname
        RegisterUserNickname(nickname_data.user_id, nickname_data.nickname)

        -- Send a response back to the caller
        ao.send({
            Target = msg.From,
            Data = "Nickname registered for user_id: " .. nickname_data.user_id
        })
    end
)

-- Define the GetUserDataById handler
Handlers.add(
    "GetUserDataById",
    Handlers.utils.hasMatchingTag("Action", "GetUserDataById"),
    function(msg)
        -- Decode the incoming JSON message
        local request_data = json.decode(msg.Data)

        -- Get the user data by user_id
        local user_data = GetUserDataById(request_data.user_id)

        -- If user data is found, send it back; otherwise, send an error message
        if user_data and next(user_data) then
            ao.send({
                Target = msg.From,
                Data = json.encode(user_data)
            })
        else
            ao.send({
                Target = msg.From,
                Data = "No user found with user_id: " .. request_data.user_id
            })
        end
    end
)

-- Define the GetUserPage handler
Handlers.add(
    "GetUserPage",
    Handlers.utils.hasMatchingTag("Action", "GetUserPage"),
    function(msg)
        -- Decode the incoming JSON message
        local request_data = json.decode(msg.Data)

        -- Get the user page data
        local user_page = GetUserPage(request_data.current_user_id, request_data.page, request_data.page_size)

        -- Send the user page data back to the caller
        ao.send({
            Target = msg.From,
            Data = json.encode(user_page)
        })
    end
)