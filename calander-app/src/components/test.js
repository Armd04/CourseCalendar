
import { useEffect, useState } from 'react';

function Test() {
const [, setTests] = useState([]);

useEffect(() => {
    async function fetchData() {
        fetch('http://localhost:8000/api/term?term=1241', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            },
        mode: 'no-cors',
        }
        )
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Parse the JSON from the response
    })
    .then(data => {
        console.log(data); // Handle the JSON data from the response
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    }

    fetchData();
}, []);

  return (
    <div>
      <p> Test</p>
    </div>
  );
}

export default Test;