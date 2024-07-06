import * as React from "react";
import Snackbar from '@mui/material/Snackbar';
import Grid from "@mui/material/Grid";
import MuiAlert from '@mui/material/Alert';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const Snack = ({ alertMessage, errors, open, setOpen }) => {
  return (
    <div>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={1500} onClose={() => {
          setOpen(false);
        }}>
        <Alert severity={errors === null ? 'success' : 'error'} sx={{ width: '100%' }}>
          {errors !== null && Array.isArray(errors) ?
            <Grid container direction={'column'}>
              {errors.map((item, index) => (
                <Grid item key={index}>
                  {item}
                </Grid>
              ))}
            </Grid>
            :
            <Grid container direction={'column'}>
              <Grid item>
                {errors !== null ? errors : alertMessage}
              </Grid>
            </Grid>
          }
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Snack;