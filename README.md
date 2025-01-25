This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Project Overview
### Installation

To install the necessary libraries, run the following commands:

```bash
npm install @othent/kms @permaweb/aoconnect
```

### Updates

- **Wallet Signature**: Wallet signatures are now handled via Othent.
- **Storage**: Arweave storage is managed through the aoconnect library.

### Project Overview

#### Application Name:
aofhe_resource_server_demo_dApp

#### Frameworks and Tools:
- **React**: Frontend framework.
- **Vite**: Build tool for fast development.
- **aoconnect**: NPM library for cryptographic operations and Arweave storage.
- **Othent**: For wallet signature management.

### Features and Implementation Details

#### 1. User Registration
**Flow**: Users sign up using OpenID OAuth2 SSO and are required to set a unique nickname.

**Expected Integration**:
```javascript
aoconnect.message('register', {
    nickname: 'string',
    oauthToken: 'string'
});
```

**Edge Cases**:
- Handle invalid OAuth tokens with appropriate error messages.
- Ensure nicknames are unique (e.g., via a `aoconnect.dry('check-nickname', { nickname: 'string' })` function).

#### 2. Wallet Integration
Users must provide a valid wallet signature via Othent to access key features.

**Expected Integration**:

**Frontend Functionality**:
- Verify wallet signatures using Othent.
- Display an error message for invalid or expired signatures.

#### 3. User Interaction
**Display Registered Users**: Fetch and list all users with their nicknames.

**Expected Integration**:

**Messaging**: Users can send encrypted messages to other users.

**Inbox feature**: Allows users to see received messages and reply.

**Message Encryption**:
- Messages are encrypted FHE ciphers of integer values.
- Encryption uses the recipient's secret key.
- Replies are encrypted using the sender's secret key.

**Example Data Structure**:

**Expected Integrations**:
- **Send a Message**:
- **Fetch Inbox**:
- **Send Reply**:

#### 4. Cryptographic Operations
**Encryption and Decryption**:
- Messages use Fully Homomorphic Encryption (FHE) for integer values.
- Encryption and decryption use recipient and sender secret keys, respectively.

**Deferred Implementation**:
- Cryptographic operations will be handled via AO (Actor-Oriented decentralized computing system).
- Data storage will use Arweave's permaweb in the Web3 ecosystem.
- Integration of aoconnect, an NPM library, for FHE encryption and decryption.

### Additional Notes
**State Management**:
- Use React Context or a state management library (e.g., Redux) to handle user sessions and wallet states.

**Edge Cases**:
- Handle nickname collisions gracefully.
- Ensure encryption errors (e.g., invalid keys) are logged and displayed properly.

**Testing**:
- Include unit tests for integration and encryption functions.
- Mock external dependencies (e.g., aoconnect, Othent) for development.
### Application Name:
### AO Processes and Cryptographic Operations

The `aoconnect` library provides an abstraction for spawning, evaluating, and interacting with AO processes. Within this project, we will create Lua code that will run in AO for cryptographic operations and index data in SQL. The data will use Arweave for persistent storage managed by AO.

#### Cryptographic Operations
**Implementation**:
- Cryptographic operations will be handled via AO processes.
- Lua scripts will be used for encryption and decryption tasks.
- Data will be indexed in SQL and stored persistently on Arweave.

**Expected Integration**:
```lua
-- Example Lua code for cryptographic operations
local function encrypt(data, key)
    -- Encryption logic here
end

local function decrypt(data, key)
    -- Decryption logic here
end
```

#### Data Persistence
**Implementation**:
- Data will be stored on Arweave's permaweb.
- AO processes will manage the interaction with Arweave for data persistence.

**Expected Integration**:
```javascript
aoconnect.message('store-data', {
    data: 'string',
    arweaveKey: 'string'
});
```

### Additional Notes
**State Management**:
- Use React Context or a state management library (e.g., Redux) to handle user sessions and wallet states.

**Edge Cases**:
- Handle nickname collisions gracefully.
- Ensure encryption errors (e.g., invalid keys) are logged and displayed properly.

**Testing**:
- Include unit tests for integration and encryption functions.
- Mock external dependencies (e.g., aoconnect, Othent) for development.
aofhe_resource_server_demo_dApp

### Frameworks and Tools:
- **React**: Frontend framework.
- **Vite**: Build tool for fast development.
- **aoconnect**: NPM library for cryptographic operations.
- **Arweave**: For permanent decentralized storage.

### Features and Implementation Details

#### 1. User Registration
**Flow**: Users sign up using OpenID OAuth2 SSO and are required to set a unique nickname.

**Expected Integration**:
```javascript
aoconnect.message('register', {
    nickname: 'string',
    oauthToken: 'string'
});
```