import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ProgressBar from '../Layout/ProgressBar';
import ChatComponent from './ChatComponent';
import { benchAC } from '../../../redux/features/';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';


const Chat = ({ membership, getMembership, errors, info, manageMembership, retrieveData, uploadChatImage }) => {
  const navigate = useNavigate();
  const { postid } = useParams();
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      await retrieveData({ room: postid });
      const res = await getMembership({ room: postid });
      if (res === 0) {
        setLoading(false);
        setTimeout(() => {
          if (window.location.href.includes('bench'))
            navigate(-1);
        }, 2000)
      }
    }
    fetch();    
  }, [])

  useEffect(() => {
    if (membership === true) {
      const socketInstance = io(import.meta.env.VITE_API_URL);
      setSocket(socketInstance);
      setLoading(false);
      return () => {
        socketInstance.disconnect();
      }
    }
  }, [membership])
  return (
    <div>
      {loading ? (
        <ProgressBar />
      ) : (
        <>
          {membership && socket ? (
            <ChatComponent socket={socket} uploadChatImage={uploadChatImage} manageMembership={manageMembership} info={{ ...info, room: postid }} />
          ) : (
            <>
              {membership === null ? (
                <ProgressBar />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <h2>{errors}</h2>
                  <h1 style={{ transform: 'rotate(90deg)' }}>{":'("}</h1>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const stateProps = (state) => {
  return {
    membership: state.bench.membership,
    info: state.bench.info,
    errors: state.bench.errors
  };
};

const actionCreators = (dispatch) => {
  return {
    getMembership: (data) => {
      return benchAC.GetMembership(dispatch, data)
    },
    manageMembership: (data) => {
      return benchAC.ManageMembership(dispatch, data);
    },
    retrieveData: (data) => {
      return benchAC.RetrieveData(dispatch, data);
    },
    uploadChatImage: (data) => {
      return benchAC.UploadChatImage(dispatch, data);
    }
  };
};

export default connect(stateProps, actionCreators)(Chat);
