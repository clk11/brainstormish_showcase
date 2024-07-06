import React from 'react';

const NotFoundPage = () => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageStyle = {
    maxWidth: '35%',
    height: 'auto',
  };

  return (
    <div style={containerStyle}>
      <img src="/404.png" alt="404 Not Found" style={imageStyle} />
    </div>
  );
};

export default NotFoundPage;
