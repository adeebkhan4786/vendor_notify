

class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  
  export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error.';
    // console.log(`Erorr: ${err}`);
  
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
    if (err.code === 11000) {    // jb database ke related error aata hai tb code ye aata hai..
      const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
      err = new ErrorHandler(message, 400)
  
    }
  
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      err: err
    })
  };
  
  export default ErrorHandler;