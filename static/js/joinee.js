const game_id = document.getElementById("game-id").innerHTML;
const username = document.getElementById("username").innerHTML;

const state = () => {
    fetch("/state", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
      game_id: game_id,
      username:username
    })})
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        if (data["state"] == "question"){
          document.getElementById("question").innerText = data["question"];
          document.getElementById("Answer").style.display = "block";
          document.getElementById("send").style.display = "block";
          document.getElementById("question").style.display = "block";
          document.getElementById("WV").style.display = "none";
        }
    })
}

const submit = () => {
  fetch("/submission", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
    game_id: game_id,
    username:username,
    submission:(document.getElementById("Answer").value)
  })})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log(data)
      document.getElementById("Answer").style.display = "none";
      document.getElementById("send").style.display = "none";
      document.getElementById("question").style.display = "none";
      document.getElementById("WV").style.display = "block";

  })
}

setInterval(()=>{state()}, 5000)