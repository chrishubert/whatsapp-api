import './Sidebar.scss'
import React, { useEffect, useState } from 'react'
import { getAllSessions, terminateAllSessions, terminateInactiveSessions } from '../../../clients/ApiClient'
import Modal from './modal/Modal'
import ErrorModal from '../../error_modal/ErrorModal'

const Sidebar = ({
  selectedSessionId,
  setSelectedSessionId,
  allSessionIds,
  setAllSessionIds,
  apiKey
}) => {

  const [closeMenu, setCloseMenu] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleCloseMenu = () => {
    setCloseMenu(!closeMenu)
  }

  function handleTerminateAllSessions () {
    try {
      terminateAllSessions(apiKey.apiKey).then(async () => {
        await reloadSessions()
      })
    } catch (error) {
      setErrorMessage(error.message)
      setErrorModalOpen(true)
    }
  }

  function handleTerminateInactiveSessions () {
    try {
      terminateInactiveSessions(apiKey.apiKey).then(async () => {
        await reloadSessions()
      })
    } catch (error) {
      setErrorMessage(error.message)
      setErrorModalOpen(true)
    }
  }

  const reloadSessions = async () => {
    try {
      await getAllSessions(apiKey.apiKey).then(r => {
        setAllSessionIds(r.ids)
        if (!r.ids.includes(selectedSessionId)) {
          setSelectedSessionId(null)
        }
      })
    } catch (error) {
      setErrorMessage(error.message)
      setErrorModalOpen(true)
    }
  }

  useEffect(() => {
    reloadSessions()
  }, [])

  let sessionListView

  if (allSessionIds != null && allSessionIds.length > 0) {
    sessionListView =
      <div className="sessionsContainer">
        <div className={closeMenu === false ? 'profileContainer' : 'profileContainer active'}>
          <p className="name">Active sessions</p>
        </div>
        <div className={closeMenu === false ? 'contentsContainer' : 'contentsContainer active'}>
          <ul>
            {allSessionIds.map((item, _) => (
              <li key={item} className={item === selectedSessionId ? 'active' : ''} onClick={() => {
                setSelectedSessionId(item)
              }}>
                <div>{item}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
  } else {
    sessionListView =
      <div className="sessionsContainer">
        <div className={closeMenu === false ? 'profileContainer' : 'profileContainer active'}>
          <div className="profileContents">
            <p className="name">No active sessions</p>
          </div>
        </div>
      </div>
  }

  return (
    <div className={closeMenu === false ? 'sidebar' : 'sidebar active'}>
      <div className={closeMenu === false ? 'logoContainer' : 'logoContainer active'}>
        <h2 className="title">Session Manager</h2>
      </div>
      <div className="terminationButtons">
        <button onClick={handleTerminateInactiveSessions}>
          <div>Terminate Inactive Sessions</div>
        </button>
        <button onClick={handleTerminateAllSessions}>
          <div>Terminate All Sessions</div>
        </button>
      </div>
      <div className={closeMenu === false ? 'burgerContainer' : 'burgerContainer active'}>
        <div className="burgerTrigger"
             onClick={() => {
               handleCloseMenu()
             }}
        ></div>
        <div className="burgerMenu"></div>
      </div>
      {sessionListView}
      <button
        className="buttonNewSession"
        onClick={() => {
          setModalOpen(true)
        }}
      >
        Create New Session
      </button>
      {modalOpen && <Modal setOpenModal={setModalOpen} setSelectedSessionId={setSelectedSessionId} getAvailableSessions={reloadSessions} apiKey={apiKey}/>}
      {errorModalOpen && <ErrorModal errorMessage={errorMessage} setErrorModalOpen={setErrorModalOpen} />}
    </div>
  )
}

export default Sidebar
