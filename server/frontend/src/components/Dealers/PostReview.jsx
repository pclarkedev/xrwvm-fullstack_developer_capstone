import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';


const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState();
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  const { id } = useParams();

  const postreview = async ()=>{
    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if(!model || review === "" || date === "" || year === "" || model === "") {
      alert("All details are mandatory")
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split[1];

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    console.log(jsoninput);
    const res = await fetch('/djangoapp/add_review', {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: jsoninput,
  });

  const json = await res.json();
  if (json.status === 200) {
      window.location.href = window.location.origin+"/dealer/"+id;
  }

  }
  const getDealer = useCallback(async () => {
    try {
      const res = await fetch(`/djangoapp/dealer/${id}`);
      const retobj = await res.json();
      if(res.ok && retobj.status === 200) {
        const dealerobjs = Array.from(retobj.dealer);
        if (dealerobjs.length > 0) setDealer(dealerobjs[0]);
      }
    } catch (error) {
      console.error('Unable to retrieve dealership', error);
    }
  }, [id]);

  const getCars = useCallback(async () => {
    try {
      const res = await fetch('/djangoapp/get_cars');
      const retobj = await res.json();
      if (res.ok) setCarmodels(Array.from(retobj.CarModels));
    } catch (error) {
      console.error('Unable to retrieve car models', error);
    }
  }, []);
  useEffect(() => {
    getDealer();
    getCars();
  }, [getDealer, getCars]);


  if (!sessionStorage.getItem('username')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Header/>
      <div  style={{margin:"5%"}}>
      <h1 style={{color:"darkblue"}}>{dealer.full_name}</h1>
      <textarea id='review' cols='50' rows='7' required aria-label="Review" onChange={(e) => setReview(e.target.value)}></textarea>
      <div className='input_field'>
      Purchase Date <input type="date" onChange={(e) => setDate(e.target.value)}/>
      </div>
      <div className='input_field'>
      Car Make 
        <select name="cars" id="cars" required defaultValue="" onChange={(e) => setModel(e.target.value)}>
        <option value="" disabled>Choose Car Make and Model</option>
      {carmodels.map(carmodel => (
          <option value={carmodel.CarMake+" "+carmodel.CarModel} key={`${carmodel.CarMake}-${carmodel.CarModel}`}>{carmodel.CarMake} {carmodel.CarModel}</option>
      ))}
      </select>        
      </div >

      <div className='input_field'>
      Car Year <input type="number" required onChange={(e) => setYear(e.target.value)} max={2026} min={2015}/>
      </div>

      <div>
      <button className='postreview' onClick={postreview}>Post Review</button>
      </div>
    </div>
    </div>
  )
}
export default PostReview
