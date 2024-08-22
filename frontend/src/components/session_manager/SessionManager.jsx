import "./SessionManager.scss";
import SessionPreview from './session_preview/SessionPreview'
import Sidebar from './sidebar/Sidebar'
import { useState } from 'react'

const SessionManager = ({
  webSocketData,
  apiKey
}) => {

  const [allSessionIds, setAllSessionIds] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  return (
    <div className='sessionManager'>
      <Sidebar
        selectedSessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
        allSessionIds={allSessionIds}
        setAllSessionIds={setAllSessionIds}
        webSocketData={webSocketData}
        apiKey={apiKey}
      />
      <SessionPreview
        selectedSessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
        allSessionIds={allSessionIds}
        setAllSessionIds={setAllSessionIds}
        webSocketData={webSocketData}
        apiKey={apiKey}
      />
    </div>
  );
}

export default SessionManager;
