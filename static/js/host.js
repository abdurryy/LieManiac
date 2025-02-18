let started = false
const game_id = document.getElementById("game-id").innerHTML;

const get_players = () => {
    fetch(`/get_players/${document.getElementById('game-id').innerText}`, {"method": "POST"})
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        update_players(data)
      }
    )
}


const update_players = (players) => {
  let cont = document.getElementById("player-list");
    cont.innerHTML = "";
    players.forEach(player => {
        let playercont = document.createElement("div");
        let name = document.createElement("p");
        let btn = document.createElement("button");
        name.innerText = player;
        btn.innerText = "KICK";
        playercont.classList.add("player")
        playercont.appendChild(name);
        playercont.appendChild(btn);
        cont.appendChild(playercont);
    });
}

const next = async () => {
    document.getElementById("wfe").style.display = "flex";
    document.getElementById("game-cont").style.display = "flex";
    document.getElementById("game").style.display = "none";
  fetch("/genquestion", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
    game_id: game_id,
  })})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log(data)
  })
  fetch("/updatestate", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
    game_id: game_id,
    state: "question",
  })})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log(data)
  })
  await updateSubmissions()
}

async function updateSubmissions() {
    xox = true
    
  while (xox){
    await new Promise(r => setTimeout(r, 2000));
    fetch("/finished", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
        game_id: game_id,
      })})
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        document.getElementById("show-answers").innerHTML = "";
        console.log("dedlete")
          if (data["ready"]){
            data["submissions"].forEach((sub)=>{
                document.getElementById("Question").innerText = data["question"];
                let submission = document.createElement("div");
                let h3 = document.createElement("h3");
                let p = document.createElement("p");
                h3.innerHTML = sub["submission"]
                p.innerHTML = sub["username"]
                submission.classList.add("submission");
                document.getElementById("show-answers").appendChild(submission);
                submission.appendChild(h3);
                submission.appendChild(p);
            })
            document.getElementById("wfe").style.display = "none";
            document.getElementById("game-cont").style.display = "flex";
            document.getElementById("game").style.display = "block";

            xox = false
          }
      })
      
  }
}



const start = async () => {
    started= true
    document.getElementById("wfe").style.display = "flex";
    document.getElementById("game-cont").style.display = "flex";
  document.getElementById("panel-cont").style.display = "none";
  
  fetch("/genquestion", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
    game_id: game_id,
  })})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log(data)
  })
  fetch("/updatestate", {"method": "POST", "headers":{"Content-Type": "application/json"}, "body":JSON.stringify({
    game_id: game_id,
    state: "question",
  })})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log(data)
  })
  await updateSubmissions()
}

setInterval(()=>{if (!started) get_players()},1000);