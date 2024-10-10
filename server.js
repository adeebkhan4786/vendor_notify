
//Importing files
import app from './app.js';




//Listen on 4000 Port
app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});