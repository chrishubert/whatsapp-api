import React from 'react'
import './ErrorModal.scss'

function ErrorModal ({
  errorMessage,
  setErrorModalOpen
}) {

  return (
    <div className="errorModalBackground">
      <div className="errorModalContainer">
        <div className="errorMessage">
          <h3>Error</h3>
          <p>{errorMessage}</p>
        </div>
        <button
          onClick={() => {
            setErrorModalOpen(false)
          }}
          id="closeErrorMsgBtn"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ErrorModal
