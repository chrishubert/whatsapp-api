import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import SessionManager from './components/session_manager/SessionManager'

function SocketConnection(apiKey) {
  const [webSocketData, setWebSocketData] = useState(null)

  useEffect(() => {
    let opt;
    if (apiKey.apiKey !== '') {
      opt = {
        autoConnect: true,
        rejectUnauthorized: true,
        auth: {
          token: apiKey.apiKey
        }
      }
    } else {
      opt = {
        autoConnect: true
      }
    }
    let socketUrl;
    if (process.env.REACT_APP_USE_WEB_SOCKET_PORT) {
      socketUrl = `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_USE_WEB_SOCKET_PORT}`
    } else {
      socketUrl = process.env.REACT_APP_BACKEND_URL
    }
    const socket = io( socketUrl, opt)
    socket.on('socketEvent', (data) => {
      setWebSocketData(data);
    });
    socket.on('connect', () => {
      console.log('Socket connected');
    })
    //clean up function
    return () => socket.close();
  }, [apiKey]);

  return (
    <SessionManager webSocketData={webSocketData} apiKey={apiKey}></SessionManager>
  );
}

export default SocketConnection;
