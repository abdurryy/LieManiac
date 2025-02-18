const create_game = () => {
    fetch("/create", {"method": "POST"})
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        window.location.href = `/host/${data}`
    })
}
