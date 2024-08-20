import React, { useState } from 'react'
import "./Modal.scss";
import { startSession } from '../../../../clients/ApiClient'

function Modal({ setOpenModal, setSelectedSessionId, getAvailableSessions }) {

  const [sessionId, setSessionId] = useState('');

  const handleCreateSession = async () => {
    let result = await startSession(sessionId);
    if (result.success) {
      await getAvailableSessions();
      setSelectedSessionId(sessionId);
      setOpenModal(false);
    }
    // TODO: Handle Failure
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
    </div>
  );
}

export default Modal;
