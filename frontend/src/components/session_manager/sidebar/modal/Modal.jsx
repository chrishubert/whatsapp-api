import React, { useState } from 'react'
import "./Modal.scss";
import { startSession } from '../../../../clients/ApiClient'
import ErrorModal from '../../../error_modal/ErrorModal'

function Modal({ setOpenModal, setSelectedSessionId, getAvailableSessions, apiKey }) {

  const [sessionId, setSessionId] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleCreateSession = async () => {
    let result = await startSession(sessionId, apiKey.apiKey);
    if (result.success) {
      await getAvailableSessions();
      setSelectedSessionId(sessionId);
      setOpenModal(false);
    } else {
      setErrorMessage(result.error)
      setErrorModalOpen(true)
    }
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="title">
          <h3>Enter Your Session ID</h3>
        </div>
        <input
          type="text"
          id="sessionId"
          name="sessionId"
          placeholder="Enter session ID"
          value={sessionId}
          onChange={
            evt => {
              setSessionId(evt.target.value)
            }
          }/>
        <div className="footer">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            id="cancelBtn"
          >
            Cancel
          </button>
          <button onClick={handleCreateSession}>Continue</button>
        </div>
      </div>
      {errorModalOpen && <ErrorModal errorMessage={errorMessage} setErrorModalOpen={setErrorModalOpen} />}
    </div>
  );
}

export default Modal;
