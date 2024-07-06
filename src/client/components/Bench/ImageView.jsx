import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const imageViewStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
};

const ImageView = ({ openImage, setOpenImage, image }) => {
  return (
    <div>
      <Modal
        open={openImage}
        onClose={() => setOpenImage(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {image && (
            <img
              src={typeof image !== "string" ? URL.createObjectURL(image) : image}
              alt=""
              style={imageViewStyle}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default ImageView;
