import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {


  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const { id } = useParams();
  const isLoggedIn = Boolean(sessionStorage.getItem('username'));
  
  const getDealer = useCallback(async () => {
    try {
      const response = await fetch(`/djangoapp/dealer/${id}`);
      const result = await response.json();
      if (response.ok && result.status === 200) {
        setDealer(Array.from(result.dealer)[0] || {});
      }
    } catch (error) {
      console.error('Unable to retrieve dealership', error);
    }
  }, [id]);

  const getReviews = useCallback(async () => {
    try {
      const response = await fetch(`/djangoapp/reviews/dealer/${id}`);
      const result = await response.json();
      if (response.ok && result.status === 200) {
        if (result.reviews.length > 0) {
          setReviews(result.reviews);
        } else {
          setUnreviewed(true);
        }
      } else {
        setUnreviewed(true);
      }
    } catch (error) {
      setUnreviewed(true);
      console.error('Unable to retrieve reviews', error);
    }
  }, [id]);

  const senti_icon = (sentiment)=>{
    let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon;
    return icon;
  }

  useEffect(() => {
    getDealer();
    getReviews();
  }, [getDealer, getReviews]);


return(
  <div style={{margin:"20px"}}>
      <Header/>
      <div style={{marginTop:"10px"}}>
      <h1 style={{color:"grey"}}>{dealer.full_name}
        {isLoggedIn && <a href={`/postreview/${id}`}><img src={review_icon} style={{width:'10%', marginLeft:'10px', marginTop:'10px'}} alt='Post Review'/></a>}
      </h1>
      <h4  style={{color:"grey"}}>{dealer['city']},{dealer['address']}, Zip - {dealer['zip']}, {dealer['state']} </h4>
      </div>
      <div className="reviews_panel">
      {reviews.length === 0 && unreviewed === false ? (
        <p>Loading reviews…</p>
      ):  unreviewed === true? <div>No reviews yet! </div> :
      reviews.map(review => (
        <div className='review_panel' key={review.id || `${review.name}-${review.review}`}>
          <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
          <div className='review'>{review.review}</div>
          <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
        </div>
      ))}
    </div>  
  </div>
)
}

export default Dealer
