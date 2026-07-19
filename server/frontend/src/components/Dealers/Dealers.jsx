import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('All');

  const filterDealers = async (state) => {
    setSelectedState(state);
    try {
      const response = await fetch(`/djangoapp/get_dealers/${state}`);
      const result = await response.json();
      if (response.ok && result.status === 200) {
        setDealersList(Array.from(result.dealers));
      }
    } catch (error) {
      console.error('Unable to filter dealerships', error);
    }
  };

  const getDealers = async () => {
    try {
      const response = await fetch('/djangoapp/get_dealers/');
      const result = await response.json();
      if (response.ok && result.status === 200) {
        const allDealers = Array.from(result.dealers);
        setStates(Array.from(new Set(allDealers.map((dealer) => dealer.state))).sort());
        setDealersList(allDealers);
      }
    } catch (error) {
      console.error('Unable to retrieve dealerships', error);
    }
  };
  useEffect(() => {
    getDealers();
  },[]);  


let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
      <Header/>

    <table className='table'>
     <thead><tr>
      <th>ID</th>
      <th>Dealer Name</th>
      <th>City</th>
      <th>Address</th>
      <th>Zip</th>
      <th>
        <select name="state" id="state" value={selectedState} onChange={(e) => filterDealers(e.target.value)}>
      <option value="All">All States</option>
      {states.map(state => (
          <option value={state} key={state}>{state}</option>
      ))}
      </select>        

      </th>
      {isLoggedIn ? (
          <th>Review Dealer</th>
         ):<></>
      }
      </tr></thead>
      <tbody>
     {dealersList.map(dealer => (
        <tr key={dealer.id}>
          <td>{dealer['id']}</td>
          <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
          <td>{dealer['city']}</td>
          <td>{dealer['address']}</td>
          <td>{dealer['zip']}</td>
          <td>{dealer['state']}</td>
          {isLoggedIn ? (
            <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
           ):<></>
          }
        </tr>
      ))}
      </tbody></table>
  </div>
)
}

export default Dealers
