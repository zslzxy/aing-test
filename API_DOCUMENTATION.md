# AingDesk Backend API Documentation

## Overview
AingDesk has been successfully converted from an Electron desktop application to a pure Node.js backend service. The server provides both HTTP REST API and Socket.IO real-time communication.

## Server Information
- **Port**: 12000 (configurable via PORT environment variable)
- **Socket.IO**: Available on the same port
- **CORS**: Enabled for all origins
- **Body Limit**: 100MB for JSON and URL-encoded data

## HTTP REST API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-05-25T11:25:34.504Z"
}
```

### Version Information
```
GET /api/version
```
Returns application version.

**Response:**
```json
{
  "status": 0,
  "code": 200,
  "msg": "Successfully obtained",
  "error_msg": "",
  "message": {
    "version": "1.2.3"
  }
}
```

### Language Management
```
GET /api/languages
```
Returns available languages and current language setting.

```
POST /api/language
Content-Type: application/json
```
Sets the application language.

**Request Body:**
```json
{
  "language": "en"
}
```

### Chat Management

#### Get Chat List
```
GET /api/chat/list
```
Returns list of all chat conversations.

#### Create New Chat
```
POST /api/chat/create
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Chat Title"
}
```

**Response:**
```json
{
  "status": 0,
  "code": 200,
  "msg": "Dialogue creation successful",
  "error_msg": "",
  "message": {
    "title": "Chat Title",
    "contextPath": "/path/to/context",
    "context_id": "uuid",
    "agent_name": "",
    "create_time": 1748172348
  }
}
```

#### Get Available Models
```
GET /api/chat/models
```
Returns list of available AI models.

#### Send Chat Message
```
POST /api/chat/send
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Your message here",
  "context_id": "chat-context-id"
}
```

## Socket.IO Events

### Connection
Connect to `http://localhost:12000` with Socket.IO client.

### Available Events

#### get_version
```javascript
socket.emit('get_version', {}, (response) => {
  console.log(response);
});
```

#### get_languages
```javascript
socket.emit('get_languages', {}, (response) => {
  console.log(response);
});
```

#### get_chat_list
```javascript
socket.emit('get_chat_list', {}, (response) => {
  console.log(response);
});
```

#### create_chat
```javascript
socket.emit('create_chat', { title: 'New Chat' }, (response) => {
  console.log(response);
});
```

#### chat
```javascript
socket.emit('chat', { 
  message: 'Hello', 
  context_id: 'chat-id' 
}, (response) => {
  console.log(response);
});
```

#### get_model_list
```javascript
socket.emit('get_model_list', {}, (response) => {
  console.log(response);
});
```

#### get_chat_info
```javascript
socket.emit('get_chat_info', { context_id: 'chat-id' }, (response) => {
  console.log(response);
});
```

#### remove_chat
```javascript
socket.emit('remove_chat', { context_id: 'chat-id' }, (response) => {
  console.log(response);
});
```

#### modify_chat_title
```javascript
socket.emit('modify_chat_title', { 
  context_id: 'chat-id', 
  title: 'New Title' 
}, (response) => {
  console.log(response);
});
```

#### delete_chat_history
```javascript
socket.emit('delete_chat_history', { context_id: 'chat-id' }, (response) => {
  console.log(response);
});
```

#### stop_generate
```javascript
socket.emit('stop_generate', { context_id: 'chat-id' }, (response) => {
  console.log(response);
});
```

#### get_last_chat_history
```javascript
socket.emit('get_last_chat_history', { context_id: 'chat-id' }, (response) => {
  console.log(response);
});
```

## Environment Variables

The server uses the following environment variables:

- `PORT`: HTTP server port (default: 12000)
- `SOCKET_PORT`: Socket.IO port (default: 12000)
- `NODE_ENV`: Environment mode (development/production)
- `EE_APP_NAME`: Application name for ee-core
- `EE_APP_VERSION`: Application version
- `EE_USER_HOME`: User home directory
- `EE_BASE_DIR`: Base application directory
- `EE_ELECTRON_DIR`: Electron directory path
- `EE_ROOT_DIR`: Root directory
- `EE_EXEC_DIR`: Execution directory
- `EE_ENV`: Environment type (server)

## Starting the Server

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build-server
```

3. Start the server:
```bash
npm start
```

The server will be available at `http://localhost:12000`

## Migration Notes

### Removed Components
- All Electron-specific dependencies and imports
- Desktop window management
- File system dialogs
- Native OS integrations
- Frontend static file serving

### Preserved Functionality
- Chat management and AI model integration
- Language support and internationalization
- Data persistence and context management
- Socket.IO real-time communication
- HTTP REST API endpoints
- Core business logic and controllers

### Architecture Changes
- Converted from Electron main process to Express.js server
- Added HTTP REST API alongside existing Socket.IO events
- Removed frontend serving (pure backend mode)
- Maintained ee-core framework compatibility
- Preserved data storage and context management