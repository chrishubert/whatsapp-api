import "./SessionPreview.scss";

import React, { useEffect, useState } from 'react'
import {
  getSessionStatus,
  getSessionQr,
  restartSession,
  terminateSession,
} from '../../../clients/ApiClient'
import QRCode from 'react-qr-code'
import ErrorModal from '../../error_modal/ErrorModal'

const SessionPreview = ({
  selectedSessionId,
  setSelectedSessionId,
  allSessionIds,
  setAllSessionIds,
  webSocketData,
  apiKey
}) => {

  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionQrString, setSessionQrString] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {

    if (webSocketData === null) {
      return
    }

    if (webSocketData.sessionId !== selectedSessionId) {
      return
    }

    if (webSocketData.dataType === 'qr') {
      setSessionQrString(webSocketData.data.qr);
      return
    }

    if (webSocketData.dataType === 'loading_screen') {
      setSessionStatus('loading'.toUpperCase());
      return
    }

    if (webSocketData.dataType === 'ready') {
      setSessionStatus('ready'.toUpperCase());
      return
    }

    const dataTypeToIgnore = ['group_update', 'contact_changed', selectedSessionId];
    if (dataTypeToIgnore.includes(webSocketData.dataType)) {
      return
    }

    // Process 'webhookEvent' from the server
    console.log('Unhandled data from webhook');
    console.log(webSocketData);
  }, [webSocketData]);

  useEffect( () => {
    async function initializeSessionInfo()
    {
      const status = await getSessionStatus(selectedSessionId, apiKey.apiKey);
      let statusString;
      if (status.success) {
        statusString = 'READY';
      } else if (status['message'] === 'session_not_connected') {
        statusString = 'NOT CONNECTED';
      } else {
        statusString = `Status check not successful because '${status.message}'`;
      }
      setSessionStatus(statusString);

      let qrImageResponse = await getSessionQr(selectedSessionId, apiKey.apiKey);
      if (qrImageResponse.success) {
        setSessionQrString(qrImageResponse.qr);
      } else {
        setSessionQrString(null)
      }
    }
    if (selectedSessionId) {
      initializeSessionInfo();
    }
  }, [selectedSessionId]);

  const handleRestartSession = async () => {
    try {
      await restartSession(selectedSessionId, apiKey.apiKey);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorModalOpen(true);
    }
  };

  const handleTerminateSession = async () => {
    try {
      const result = await terminateSession(selectedSessionId, apiKey.apiKey);
      if (result.success) {
        const index = allSessionIds.indexOf(selectedSessionId);
        const newArray = allSessionIds.toSpliced(index, 1);
        await setSelectedSessionId(null);
        await setAllSessionIds(newArray);
      } else {
        setErrorMessage(result.error);
        setErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setErrorModalOpen(true);
    }
  };

  if (!selectedSessionId) {
    return (
      <div className="sessionPreview">
        <div className="emptySession">Select session on side bar</div>
      </div>
    );
  }

  let qrImage;
  if (sessionStatus !== 'NOT CONNECTED') {
    qrImage = undefined;
  } else if (sessionQrString) {
    qrImage = <div className="sessionQrSection"><QRCode className="sessionQrImage" value={sessionQrString} /></div>;
  } else {
    qrImage = <div className="sessionQrSection"><p>No Session Qr Available</p></div>;
  }

  let status;
  if (sessionStatus) {
    status = <div className="sessionStatus">Status <p>{sessionStatus}</p></div>;
  } else {
    status = <div className="sessionStatus">Status <p>Unknown</p></div>;
  }

  return (
    <div className="sessionPreview">

      <div className="sessionInfo">
        <div className="sessionID">ID <p>{selectedSessionId}</p></div>
        {status}
      </div>

      {qrImage}

      <button onClick={handleRestartSession}>Restart Session</button>
      <button onClick={handleTerminateSession}>Terminate Session</button>
      {errorModalOpen && <ErrorModal errorMessage={errorMessage} setErrorModalOpen={setErrorModalOpen} />}
    </div>
  );
};

export default SessionPreview;
