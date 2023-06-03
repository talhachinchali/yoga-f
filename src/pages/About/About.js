import React from 'react'

import './About.css'
import img1 from './img1.jpg'
import img2 from './img2.jpg'
import img3 from './img3.jpg'
import mam from './mam.jpeg'

export default function About() {
    return (
        <body className='aboutbody'>
        <div class="container">
          <h1 class="heading"><span>meet</span>Our Team</h1>
      
          <div class="profiles">
            <div class="profile">
              <img src="https://i.ibb.co/4dJTfNc/Whats-App-Image-2023-02-24-at-6-29-26-PM.jpg" class="profile-img" alt="William"/>
      
              <h3 class="user-name">POOJA M. T</h3>
              <h5>Team Leader</h5>
              
            </div>
            <div class="profile">
              <img src="https://i.ibb.co/XV4Y2LY/parasu-removebg-copy.png" class="profile-img"/>
      
              <h3 class="user-name">PARASURAM E</h3>
              <h5>Team member</h5>
              
            </div>
           
            <div class="profile">
              <img src="https://i.ibb.co/1KNXYyZ/mayuri-photo.png" class="profile-img"/>
      
              <h3 class="user-name">Mayuri I. K</h3>
              <h5>Team member</h5>
              
            </div>
            <div class="profile">
              <img src="https://i.ibb.co/JmmXjFF/coat.jpg" class="profile-img"/>
      
              <h3 class="user-name">Talha M. C</h3>
              <h5>Team member</h5>
             
            </div>
            <div class="profile">
              <img src={mam} class="profile-img"/>
      
              <h3 class="user-name">Prof. Priyanka S. Tuppad</h3>
              <h5>Project Guide</h5>
              
            </div>
            
          </div>
        </div>
      </body>
    )
}
