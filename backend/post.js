const axios = require("axios");

axios.post("http://localhost:3000/letters", {

  sender: "Eve",
  recipient: "Frank",
  message: "Good morning!"
})
.then(response => console.log(response.data))
.catch(error => console.error("Error:", error));



// axios.put("http://localhost:3000/letters/1", {
//   message: "Hello Bob! How are you?"
// })
// .then(response => console.log(response.data))
// .catch(error => console.error("Error:", error));
