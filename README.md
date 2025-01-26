## Project Overview
### Installation

To install the necessary libraries, run the following commands:

```bash
npm install @othent/kms @permaweb/aoconnect
```

### Starting a New Demo Project

To start a new demo project, you need to start an AOS node with the following command:

```bash
aos project_name --module=GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0
```

In the AOS process, load the `orchestrator_node_api.lua` code with:

```bash
.load process/orchestrator_node_api.lua
```

After that, run the initialization command:

```bash
npm run init
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

#### 2. User Interaction
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

#### 3. Cryptographic Operations
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

