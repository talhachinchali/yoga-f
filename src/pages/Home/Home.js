import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import smoothscroll from 'smoothscroll-polyfill';
import { ReactComponent as MenuIcon } from './menuIcon.svg';


export default function Home() {
  smoothscroll.polyfill(); 
    const textRef = useRef(null);
    const bird1Ref = useRef(null);
    const bird2Ref = useRef(null);
    const btnRef = useRef(null);
    const rocksRef = useRef(null);
    const forestRef = useRef(null);
    const waterRef = useRef(null);
    const headerRef = useRef(null);
  
    useEffect(() => {
        window.addEventListener('scroll', function() {
          const value = window.scrollY;
      
          if (textRef.current) {
            textRef.current.style.top = 50 + value * -0.1 + '%';
          }
      
          if (bird2Ref.current) {
            bird2Ref.current.style.top = value * -1.5 + 'px';
            bird2Ref.current.style.left = value * 2 + 'px';
          }
      
          if (bird1Ref.current) {
            bird1Ref.current.style.top = value * -1.5 + 'px';
            bird1Ref.current.style.left = value * -5 + 'px';
          }
      
          if (btnRef.current) {
            btnRef.current.style.marginTop = value * 1.5 + 'px';
          }
      
          if (rocksRef.current) {
            rocksRef.current.style.top = value * -0.12 + 'px';
          }
      
          if (forestRef.current) {
            forestRef.current.style.top = value * 0.25 + 'px';
          }
      
          if (headerRef.current) {
            headerRef.current.style.top = value * 0.5 + 'px';
          }
        });
      }, []);
  
     

      function handleMenuToggle() {
        const ul = document.querySelector('#header ul');
        ul.classList.toggle('show');
      }

  return (
    <body style={{ overflow: 'hidden' }}>
      <header id="header" >
        <a href="#" class="logo"  ref={headerRef}>
          E-YOGALAYA
        </a>
        <ul>
          <Link to="/home">
            <a href="#" class="active">
              Home
            </a>
          </Link>
          <Link to="/about">
            <a href="#">About Us</a>
          </Link>
          <Link to="/tutorials">
            <a href="#">Tutorials</a>
          </Link>
          
           
          
        </ul>
        {window.innerWidth <= 768 && (
        <div className="menu-toggle" onClick={handleMenuToggle}>
          <MenuIcon />
        </div>
      )}
      </header>
      
      <section>
        <h2 id="text" ref={textRef}>
          <span className="span">Health is Wealth</span>
          <br />E-Yogalaya
        </h2>

        <img
          src="https://user-images.githubusercontent.com/65358991/170092504-132fa547-5ced-40e5-ab64-ded61518fac2.png"
          id="bird1"
          ref={bird1Ref}
        />
        <img
          src="https://user-images.githubusercontent.com/65358991/170092542-9747edcc-fb51-4e21-aaf5-a61119393618.png"
          id="bird2"
          ref={bird2Ref}
        />
        <img src="https://user-images.githubusercontent.com/65358991/170092559-883fe071-eb4f-4610-8c8b-a037d061c617.png" id="forest" ref={forestRef} />
        
        <Link to='/start'><a href="#" id="btn" ref={btnRef} >start</a></Link>
        
        <img src="https://i.ibb.co/3sh5PzG/rocks-copy2.png" id="rocks" ref={rocksRef}/>
        <img src="https://user-images.githubusercontent.com/65358991/170092616-5a70c4af-2eed-496f-bde9-b5fcc7142a31.png" id="water" ref={waterRef}/>
    </section>
    <div class="sec">
        <h2>E-Yogalaya</h2>
        <p> e-Yogalaya app is a cutting-edge tool that can help you improve your yoga practice and reach your fitness goals. With real-time feedback, customized workout routines, virtual and augmented reality yoga studios, online tutorials, e-yogalaya has everything you need to take your yoga practice to the next level.
            <br/>

Whether you're a beginner or an experienced practitioner, e-yogalaya has something for everyone. Whether you're looking to build strength, increase flexibility, or simply reduce stress, e-yogalaya can help you. So if you're ready to take your yoga practice to the next level, try our E-Yogalaya app today!
<br/>
</p>
    </div>
    </body>
    
)
  }
