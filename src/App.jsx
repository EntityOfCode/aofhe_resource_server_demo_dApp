import { useState, useEffect } from 'react';
import UserRegistration from './components/UserRegistration';
import RegisteredUsers from './components/RegisteredUsers';
import MessagesDashboard from './components/MessagesDashboard';
import Footer from "./components/Footer";
import Header from "./components/Header";
import Loader from './components/Loader'
import {
  Othent 
} from "@othent/kms";
import { v4 as uuidv4 } from 'uuid';
import {
  createDataItemSigner,
  dryrun,
  message,
  spawn
} from '@permaweb/aoconnect';

const appInfo = {
  name: "AO FHE JWT DEMO",
  version: "1.0.0",
  env: "production",
};


const othent = new Othent({ appInfo, throwErrors: false, auth0Cache: 'localstorage' });

function App() {

  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersCurrentPage, setUsersCurrentPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [favoriteUsersCurrentPage, setFavoriteUsersCurrentPage] = useState(0);
  const [favoriteUsersTotalPages, setFavoriteUsersTotalPages] = useState(1);


  const [inboxMessages, setInboxMessages] = useState([]);
  const [inboxCurrentPage, setInboxCurrentPage] = useState(0);
  const [inboxTotalPages, setInboxTotalPages] = useState(1);

  const [outboxMessages, setOutboxMessages] = useState([]);
  const [outboxCurrentPage, setOutboxCurrentPage] = useState(0);
  const [outboxTotalPages, setOutboxTotalPages] = useState(1);

  const fetchUsers = async (page) => {
    const { users, totalPages } = await handleFetchUserPage(page);
    setUsers(users);
    setUsersTotalPages(totalPages);
  }

  const fetchFavoriteUsers = async (page) => {
    const { users, totalPages } = await handleFetchFavoriteUserPage(page);
    setFavoriteUsers(users);
    setFavoriteUsersTotalPages(totalPages);
  }

  useEffect(() => {
    if(usersCurrentPage > 0) {
      console.log(`Fetching users for page: ${usersCurrentPage}`);
      fetchUsers(usersCurrentPage);
  }
  }, [usersCurrentPage]);

  useEffect(() => {
    if(favoriteUsersCurrentPage > 0) {
      console.log(`Fetching favorite users for page: ${favoriteUsersCurrentPage}`);
      fetchFavoriteUsers(favoriteUsersCurrentPage);
  }
  }, [favoriteUsersCurrentPage]);

  const fetchInbox = async (page) => {
    const { messages, totalPages } = await handleFetchInboxPage(page);
    for(let i = 0; i < messages.length; i++) {
      const decryptedValue = await decryptIntegerValue(messages[i].message);
      messages[i]['plainMessage'] = decryptedValue;
      const senderUserDetails = await getUserDetailsById(messages[i].sender_id);
      messages[i]['senderId'] = senderUserDetails.nickname ? senderUserDetails.nickname : senderUserDetails.user_id;
      for(let k = 0; k < messages[i].replies.replies.length; k++) {
        const decryptedReplyValue = await decryptIntegerValue(messages[i].replies.replies[k].message);
        messages[i].replies.replies[k]['plainMessage'] = decryptedReplyValue;
      }
    }
    setInboxMessages(messages);
    setInboxTotalPages(totalPages);
    setLoading(false);
  }

  useEffect(() => {
    if(inboxCurrentPage > 0) {
      console.log(`Fetching users inbox for page: ${inboxCurrentPage}`);
      fetchInbox(inboxCurrentPage);
  }
  }, [inboxCurrentPage]);

  const fetchOutbox = async (page) => {
    const { messages, totalPages } = await handleFetchOutboxPage(page);
    for(let i = 0; i < messages.length; i++) {
      const decryptedValue = await decryptIntegerValue(messages[i].message);
      messages[i]['plainMessage'] = decryptedValue;
      const receiverUserDetails = await getUserDetailsById(messages[i].recipient_id);
      messages[i]['receiverId'] = receiverUserDetails.nickname ? receiverUserDetails.nickname : receiverUserDetails.user_id;
      for(let k = 0; k < messages[i].replies.replies.length; k++) {
        const decryptedReplyValue = await decryptIntegerValue(messages[i].replies.replies[k].message);
        messages[i].replies.replies[k]['plainMessage'] = decryptedReplyValue;
      }
    }
    setOutboxMessages(messages);
    setOutboxTotalPages(totalPages);
    setLoading(false);
  }

  useEffect(() => {
    if(outboxCurrentPage > 0) {
      console.log(`Fetching users out for page: ${outboxCurrentPage}`);
      fetchOutbox(outboxCurrentPage);
  }
  }, [outboxCurrentPage]);


  const handleUsersNextPage = () => {
    if (usersCurrentPage < usersTotalPages) {
      setUsersCurrentPage(usersCurrentPage + 1);
    }
  };

  const handleFavoriteUsersNextPage = () => {
    if (favoriteUsersCurrentPage < favoriteUsersTotalPages) {
      setUsersCurrentPage(favoriteUsersCurrentPage + 1);
    }
  };

  const handleUsersPreviousPage = () => {
    if (usersCurrentPage > 1) {
      setUsersCurrentPage(usersCurrentPage - 1);
    }
  };

  const handleFavoriteUsersPreviousPage = () => {
    if (favoriteUsersCurrentPage > 1) {
      setFavoriteUsersCurrentPage(favoriteUsersCurrentPage - 1);
    }
  };

  const handleInboxNextPage = () => {
    if (inboxCurrentPage < inboxTotalPages) {
      setInboxCurrentPage(inboxCurrentPage + 1);
    }
  };

  const handleInboxPreviousPage = () => {
    if (inboxCurrentPage > 1) {
      setInboxCurrentPage(inboxCurrentPage - 1);
    }
  };

  const handleOutboxNextPage = () => {
    if (outboxCurrentPage < outboxTotalPages) {
      setOutboxCurrentPage(outboxCurrentPage + 1);
    }
  };

  const handleOutboxPreviousPage = () => {
    if (outboxCurrentPage > 1) {
      setOutboxCurrentPage(outboxCurrentPage - 1);
    }
  };

  // Define callback functions
  const handleUserRegistration = async (nickname) => {    
    // Implementation will be added later
    setLoading(true);
    const data = {user_id: othent.getSyncUserDetails().sub, nickname: nickname};
    const VITE_APP_AO_ORCHESTRATOR_ID = import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID;
    message({ 
      process: VITE_APP_AO_ORCHESTRATOR_ID,
      signer: createDataItemSigner(await getSinger()),
      data: JSON.stringify(data),
      tags: [{ name: 'Action', value: 'RegisterUserNickname' }],
    }).then((registerUserNickNameMsgId) => {
          console.log("Create User Message ID", registerUserNickNameMsgId);
          user.nickname = nickname;
          setUser(user);
        setLoading(false);  
    });  
  };

    // Define callback functions
    const handleAddFavoriteUser = async (favorite_user) => {    
      // Implementation will be added later
      setLoading(true);
      const uuid = uuidv4();

      const data = {favorite_id: uuid, user_id: othent.getSyncUserDetails().sub, favorite_user_id: favorite_user.user_id};
      message({ 
        process: user.data_node_id,
        signer: createDataItemSigner(await getSinger()),
        data: JSON.stringify(data),
        tags: [{ name: 'Action', value: 'AddFavoriteUser' }],
      }).then((addFavoriteUserMsgId) => {
            console.log("Add Favorite User Message ID", addFavoriteUserMsgId);
          setLoading(false);  
          fetchFavoriteUsers(favoriteUsersCurrentPage);
      });  
    };
  
  const handleFetchUserPage = (page) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      const data = { current_user_id: othent.getSyncUserDetails().sub, page: page, page_size: 5 };
      const VITE_APP_AO_ORCHESTRATOR_ID = import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID;
      try {
        const txData = await dryrun({
          process: VITE_APP_AO_ORCHESTRATOR_ID,
          data: JSON.stringify(data),
          tags: [{ name: 'Action', value: 'GetUserPage' }],
        });
        if(txData.Messages.length > 0) {
          const userPage = JSON.parse(txData.Messages[0].Data);
          console.log("Fetched User Page", userPage);
          setLoading(false);
          resolve({users: userPage.users, totalPages: userPage.total_size});
        } else {
          setLoading(false);
          reject("No user page found");
        }
      } catch (error) {
        console.error("Error fetching user page:", error);
        setLoading(false);
        reject(error);
      }
    });
  };

  const handleFetchFavoriteUserPage = (page) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      const data = { user_id: othent.getSyncUserDetails().sub, page: page, page_size: 5 };
      try {
        const txData = await dryrun({
          process: user.data_node_id,
          data: JSON.stringify(data),
          tags: [{ name: 'Action', value: 'GetFavoriteUsers' }],
        });
        if(txData.Messages.length > 0) {
          const userPage = JSON.parse(txData.Messages[0].Data);
          console.log("Fetched User Page", userPage);
          setLoading(false);
          resolve({users: userPage.favorites, totalPages: userPage.total_size});
        } else {
          setLoading(false);
          reject("No user page found");
        }
      } catch (error) {
        console.error("Error fetching user page:", error);
        setLoading(false);
        reject(error);
      }
    });
  };

  const handleFetchInboxPage = (page) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      const data = { user_id: othent.getSyncUserDetails().sub, page: page, page_size: 5 };
      try {
        const txData = await dryrun({
          process: user.data_node_id,
          data: JSON.stringify(data),
          tags: [{ name: 'Action', value: 'GetInboxPage' }],
        });
        if(txData.Messages.length > 0) {
          const inboxPage = JSON.parse(txData.Messages[0].Data);
          console.log("Fetched User Inbox Page", inboxPage);
          resolve({messages: inboxPage.messages, totalPages: inboxPage.total_size});
        } else {
          reject("No user inbox page found");
        }
      } catch (error) {
        console.error("Error fetching user inbox page:", error);
        reject(error);
      }
    });
  };

  const handleFetchOutboxPage = (page) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      const data = { user_id: othent.getSyncUserDetails().sub, page: page, page_size: 5 };
      try {
        const txData = await dryrun({
          process: user.data_node_id,
          data: JSON.stringify(data),
          tags: [{ name: 'Action', value: 'GetOutboxPage' }],
        });
        if(txData.Messages.length > 0) {
          const outboxPage = JSON.parse(txData.Messages[0].Data);
          console.log("Fetched User Outbox Page", outboxPage);
          resolve({messages: outboxPage.messages, totalPages: outboxPage.total_size});
        } else {
          reject("No user outbox page found");
        }
      } catch (error) {
        console.error("Error fetching user outbox page:", error);
        reject(error);
      }
    });
  };

    // connect/disconnect function
    const toggleConnection = () => {
      setLoading(true)
      // ao_disconnect()
      if (isConnected) {
          ao_disconnect()
      } else {
          ao_connect()
      }
  }


  const sendReply = async (originalMessage) => {
    // Implementation will be added later
    setLoading(true);
    const walletSing = await getSinger();
    console.log("Original Message", originalMessage);
    const replyData = {reply_id: originalMessage.inbox_id, inbox_id: originalMessage.inbox_id, user_id: user.user_id, recipient_id: originalMessage.sender_id, message: originalMessage.message};
    const createReplyMsgId = await message({ 
      process: user.data_node_id,
      signer: createDataItemSigner(walletSing),
      data: JSON.stringify(replyData),
      tags: [{ name: 'Action', value: 'InsertReplyMessage' }],
    });
    console.log("Create Reply Message ID", createReplyMsgId);
    const toUser = await getUserDetailsById(originalMessage.sender_id);
    const toUserEncryptedValueTx = await dryrun({
      process: toUser.crypto_node_id,
      data: originalMessage.plainMessage,
      tags: [{ name: 'Action', value: 'EncryptIntegerValue' }],
    });
    if(toUserEncryptedValueTx.Messages.length > 0) {
      const toUserEncryptedValue = toUserEncryptedValueTx.Messages[0].Data;
      const requestReplyData = {reply_id: originalMessage.inbox_id, inbox_id: originalMessage.inbox_id, user_id: originalMessage.sender_id, recipient_id: user.user_id, message: toUserEncryptedValue};
      const createRequestReplyMsgId = await message({ 
        process: toUser.data_node_id,
        signer: createDataItemSigner(walletSing),
        data: JSON.stringify(requestReplyData),
        tags: [{ name: 'Action', value: 'InsertReplyMessage' }],
      });
      console.log("Create Request Reply Message ID", createRequestReplyMsgId);
      }
    await fetchInbox(inboxCurrentPage);
    // setInboxCurrentPage(inboxCurrentPage);
    setLoading(false);
  };

  const ao_connect = async () => {
    const res = await othent.connect();
    if(othent.getSyncUserDetails() === null) {
      ao_disconnect();
      ao_connect();
    }
    console.log("Connect,\n", res);
    console.log('othent', othent.auth0)
    const clientPromise = await othent.auth0.auth0ClientPromise; 
    const id_token = clientPromise.userCache.get('@@user@@').id_token;
    console.log('id_token', id_token)
    setIsConnected(true)
    // setLoading(false)
    console.log("Connected")
    const userDetails = await getUserDetails();
    console.log("User Details", userDetails);    
    if(userDetails === null) {
      console.log("User not found, please register");   
      await userSignUp(othent.getSyncUserDetails().sub, id_token);   
    } else {
      setUser(userDetails);
      setLoading(false);
      setUsersCurrentPage(1);
      setFavoriteUsersCurrentPage(1);
      setInboxCurrentPage(1);
      setOutboxCurrentPage(1);
    }
    // Add additional logic for establishing a connection if necessary
}

const getUserDetails = async () => {
  return await getUserDetailsById(othent.getSyncUserDetails().sub);
}

const getUserDetailsById = async (user_id) => {
  const data = {user_id: user_id};
  const userDetails = await dryrun({
      process: import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID,
      data: JSON.stringify(data),
      tags: [{ name: 'Action', value: 'GetUserDataById' }],
  });
  if(userDetails.Messages.length > 0) {
    if(userDetails.Messages[0].Data === "No user found with user_id: " + othent.getSyncUserDetails().sub) {
      return null;
    }
    const sqlJson = JSON.parse(userDetails.Messages[0].Data);
    return sqlJson;
  }
  return null;
}

const getSinger = () => {
  const singer = Object.assign({}, othent, {
      getActiveAddress: () => 
          //@ts-ignore
        othent.getActiveKey(),
      getAddress: () => 
          //@ts-ignore
        othent.getActiveKey(),
      singer: 
      //@ts-ignore
      tx => othent.sign(tx),
      type: 'arweave'
    })
    return singer
  
  }

const sendEncryptIntegerValue = async (toUser, value) => {
  //todo: implement this function
  setLoading(true);
  const uuid = uuidv4();
  console.log("Generated UUID:", uuid);
    const userEncryptedValueTx = await dryrun({
      process: user.crypto_node_id,
      data: value.toString(),
      tags: [{ name: 'Action', value: 'EncryptIntegerValue' }],
    });
    if(userEncryptedValueTx.Messages.length > 0) {
      const userEncryptedValue = userEncryptedValueTx.Messages[0].Data;
      const toUserEncryptedValueTx = await dryrun({
        process: toUser.crypto_node_id,
        data: value.toString(),
        tags: [{ name: 'Action', value: 'EncryptIntegerValue' }],
      });
      if(toUserEncryptedValueTx.Messages.length > 0) {
        const toUserEncryptedValue = toUserEncryptedValueTx.Messages[0].Data;
        const decryptedValue = await decryptIntegerValue(userEncryptedValue);
        console.log("Decrypted Value:", decryptedValue);
        const walletSing = await getSinger();
        const inboxData = {inbox_id : uuid, user_id: toUser.user_id, sender_id: user.user_id, message: userEncryptedValue};
        const outboxData = {outbox_id : uuid, user_id: user.user_id, recipient_id: toUser.user_id, message: toUserEncryptedValue};
        const createInboxMsgId = await message({ 
          process: toUser.data_node_id,
          signer: createDataItemSigner(walletSing),
          data: JSON.stringify(inboxData),
          tags: [{ name: 'Action', value: 'InsertInboxMessage' }],
        });
        console.log("Create Inbox Message ID", createInboxMsgId);
        const createOutboxMsgId = await message({ 
          process: user.data_node_id,
          signer: createDataItemSigner(walletSing),
          data: JSON.stringify(outboxData),
          tags: [{ name: 'Action', value: 'InsertOutboxMessage' }],
        });
        console.log("Create Outbox Message ID", createOutboxMsgId);
        await fetchOutbox(outboxCurrentPage);
        // setOutboxCurrentPage(outboxCurrentPage);
        setLoading(false);
      }  
    }
}  

const decryptIntegerValue = async (encryptedValue) => {
  const clientPromise = await othent.auth0.auth0ClientPromise; 
  const id_token = clientPromise.userCache.get('@@user@@').id_token;
  const jwksBase64 = await fetchJwksBase64(id_token);
  const decryptedValue = await dryrun({
    process: user.crypto_node_id,
    data: encryptedValue.toString(),
    tags: [
        { name: 'Action', value: 'DecryptIntegerValue' },
        { name: 'id_token', value: id_token },
        { name: 'jwks', value: jwksBase64 },
    ],
  });
  return decryptedValue.Messages[0].Data;
}

const CreateUser = async (sub, dataNodeProcessId, fheNodeProcessId, schema_version, walletSing) => {
  // Implementation will be added later
  const data = {user_id: sub, data_node_id: dataNodeProcessId, crypto_node_id: fheNodeProcessId, schema_version: schema_version};
  const VITE_APP_AO_ORCHESTRATOR_ID = import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID;
  const createUserMsgId = await message({ 
    process: VITE_APP_AO_ORCHESTRATOR_ID,
    signer: createDataItemSigner(walletSing),
    data: JSON.stringify(data),
    tags: [{ name: 'Action', value: 'CreateUser' }],
  });
  console.log("Create User Message ID", createUserMsgId);
  setUser(data);
  setLoading(false);
  setUsersCurrentPage(1);
  setInboxCurrentPage(1);
  setOutboxCurrentPage(1);
};

const userSignUp = async (sub, oauthToken) => {
  const walletSing = await getSinger()
  const dataNodeProcessId = await spawnDataNode(sub, walletSing);
  const latestApi = await getLatestApi("user");
  if(dataNodeProcessId && latestApi && latestApi.script_content) {
    setTimeout(async function (){
      await message({
        process: dataNodeProcessId,
        signer: createDataItemSigner(walletSing),
        // the survey as stringified JSON
        data: latestApi.script_content,
        tags: [{ name: 'Action', value: 'Eval' }],
      });  
      const schemaSql = await getLatestSchemaManagement("user");
      if(schemaSql && schemaSql.schema_sql) {
        await message({
          process: dataNodeProcessId,
          signer: createDataItemSigner(walletSing),
          // the survey as stringified JSON
          data: schemaSql.schema_sql,
          tags: [{ name: 'Action', value: 'InitDb' }],
        });        
      }
      const fheNodeProcessId = await spawnFheNode(sub, walletSing);
      const latestFheApi = await getLatestApi("crypto");
      if(fheNodeProcessId && latestFheApi && latestFheApi.script_content) {
        setTimeout(async function () {
          await message({
            process: fheNodeProcessId,
            signer: createDataItemSigner(walletSing),
            // the survey as stringified JSON
            data: latestFheApi.script_content,
            tags: [{ name: 'Action', value: 'Eval' }],
          });  
          const jwksBase64 = await fetchJwksBase64(oauthToken);
          const registerTokenData = JSON.stringify({id_token : oauthToken, jwks: jwksBase64 });
          await message({
            process: fheNodeProcessId,
            signer: createDataItemSigner(walletSing),
            // the survey as stringified JSON
            data: registerTokenData,
            tags: [{ name: 'Action', value: 'RegisterToken' }],
          });       
          await CreateUser(sub, dataNodeProcessId, fheNodeProcessId, schemaSql.schema_version, walletSing);                     
        } , 5000);
  
      }                
    } , 5000);  
  }
}

// Helper function to convert JSON to Base64
const jsonToBase64 = (json) => {
  return btoa(JSON.stringify(json));
}

// Helper function to decode the JWT payload
const decodeJwtPayload = (token) => {
  const base64Payload = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(base64Payload));
  return decodedPayload;
}

// Construct JWKS URL from Issuer
const getJwksUrlFromIssuer = (issuer) => {
  return `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
}


// Function to fetch JWKS and convert to Base64
const fetchJwksBase64 = async(jwt) => {
  try {
    // Decode JWT payload to get 'iss' (issuer)
    const payload = decodeJwtPayload(jwt);
    if (!payload.iss) {
      throw new Error('Issuer (iss) not found in JWT payload');
    }

    // Construct JWKS URL
    const jwksUrl = getJwksUrlFromIssuer(payload.iss);

    // Fetch JWKS
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch JWKS');
    }

    const jwksJson = await response.json();

    // Convert JWKS JSON to Base64
    const jwksBase64 = jsonToBase64(jwksJson);

    return jwksBase64;
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    throw error;
  }
}


const getLatestApi = async (node_type) => {
  const data = {node_type: node_type};
  const txData =  await dryrun({
      process: import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID,
      data: JSON.stringify(data),
      tags: [{ name: 'Action', value: 'GetLatestNodeScript' }],
  });
  if(txData.Messages.length > 0) {
    const scriptJson = JSON.parse(txData.Messages[0].Data);
    return scriptJson;
  }
  return null;
}

const getLatestSchemaManagement = async (node_type) => {
  const data = {node_type: node_type};
  const txData =  await dryrun({
      process: import.meta.env.VITE_APP_AO_ORCHESTRATOR_ID,
      data: JSON.stringify(data),
      tags: [{ name: 'Action', value: 'GetLatestSchemaManagement' }],
  });
  if(txData.Messages.length > 0) {
    const sqlJson = JSON.parse(txData.Messages[0].Data);
    return sqlJson;
  }
  return null;
}


const spawnDataNode = async(sub, walletSing) => {
  const module_id = import.meta.env.VITE_APP_AO_SQL_LITE_MODULE_ID;
  const scheduler_id = import.meta.env.VITE_APP_AO_SCHEDULER_ID;

  return await spawn({
    // The Arweave TXID of the ao Module
    module: module_id,
    // The Arweave wallet address of a Scheduler Unit
    scheduler: scheduler_id,
    // A signer function containing your wallet
    signer: createDataItemSigner(walletSing),
    /*
      Refer to a Processes' source code or documentation
      for tags that may effect its computation.
    */
    tags: [
      { name: "Name", value: "ao-fhe-data-demo-" + sub  },
    ],
  });
}

const spawnFheNode = async(sub, walletSing) => {
  const module_id = import.meta.env.VITE_APP_AO_FHE_MODULE_ID;
  const scheduler_id = import.meta.env.VITE_APP_AO_SCHEDULER_ID;
  return await spawn({
    // The Arweave TXID of the ao Module
    module: module_id,
    // The Arweave wallet address of a Scheduler Unit
    scheduler: scheduler_id,
    // A signer function containing your wallet
    signer: createDataItemSigner(walletSing),
    /*
      Refer to a Processes' source code or documentation
      for tags that may effect its computation.
    */
    tags: [
      { name: "Name", value: "ao-fhe-crypto-demo-" + sub  },
    ],
  });
}

const ao_disconnect = async () => {
    const res = await othent.disconnect();
    console.log("Disconnect,\n", res);
    setIsConnected(false)
    setLoading(false)
    console.log("Disconnected")
    // Add additional logic for disconnecting if necessary
}

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col top-0 text-white">
        <Header />
        <div>
          {loading ? (
            <Loader />
          ) : (
            <>
          {othent.isAuthenticated ? (
            <>
            <div>
              You are logged in.
            </div>
            <button className="bg-sky-600 text-white py-2 px-4 rounded" onClick={() => toggleConnection()}>Log Out</button>
              {user && user.nickname ? (
                <>
                  <div>
                    Welcome, {user.nickname}!
                  </div>
                </>
              ) :(
                <>
                  <UserRegistration onRegister={handleUserRegistration} />
                </>
              )}            
              <RegisteredUsers users={users} currentPage={usersCurrentPage} totalPages={Math.ceil(usersTotalPages / 5)} handleNextPage={handleUsersNextPage} handlePreviousPage={handleUsersPreviousPage} sendEncryptIntegerValue={sendEncryptIntegerValue}
                                favoriteUsers={favoriteUsers} favoriteUsersCurrentPage={favoriteUsersCurrentPage} favoriteUsersTotalPages={Math.ceil(favoriteUsersTotalPages / 5)} 
                                handleFavoriteUsersNextPage={handleFavoriteUsersNextPage} handleFavoriteUsersPreviousPage={handleFavoriteUsersPreviousPage} handleAddFavoriteUser={handleAddFavoriteUser} isDarkMode={false}
              />
              <MessagesDashboard inboxMessages={inboxMessages} inboxCurrentPage={inboxCurrentPage} inboxTotalPages={Math.ceil(inboxTotalPages / 5)} handleInboxNextPage={handleInboxNextPage} handleInboxPreviousPage={handleInboxPreviousPage} sendReply={sendReply}
                                outboxMessages={outboxMessages} outboxCurrentPage={outboxCurrentPage} outboxTotalPages={Math.ceil(outboxTotalPages / 5)} handleOutboxNextPage={handleOutboxNextPage} handleOutboxPreviousPage={handleOutboxPreviousPage} />
            </>
          ) : (
            <>
            <div>
              Please log in to access the application.
            </div>
            <button className="bg-sky-600 text-white py-2 px-4 rounded" onClick={() => toggleConnection()}>Log In</button>
            </> 
          )}
          </> 
          )}
        </div>
        {/* <Footer /> */}
      </div>
    </>
  );
}

export default App;