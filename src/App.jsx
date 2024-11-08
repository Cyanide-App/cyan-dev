// setup uv on vercel: https://github.com/crllect/UV-on-vercel

import React, { useState, useEffect, useRef } from "react";
import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Search, Plus } from "lucide-react";
import Chat from "./Chat";
import "./App.css";
import { Form } from "react-router-dom";
import ASCII from './ASCII';

function SplashText() {
  const [text, setText] = useState("");
  const splashTexts = [1, 2, 3, 4];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * splashTexts.length);
    setText(splashTexts[randomIndex].toString());
  }, []);

  return <h4 className="splash-text">{text}</h4>;
}



function SearchBar() {
 // removing proxy for now

  return (
    <div className="search-input-wrapper">
      <Search className="search-icon" />
      <input
        type="text"
        id="urlInput"
        placeholder="// PROXY COMMING SOON"
      />
      <button id="searchButton">Search Text</button>
    </div>
  );
}


export default function App() {

  
  return (
    <section className="layout">
      <div className="header frame">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <ASCII />

        <h4 className="title">:header</h4>
        <div className="hero">

          <h1 className="hero-title">cyλn</h1>
          {/* <SplashText /> */}
        </div>
      </div>


      <div className="navbar">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <h4 className="title">:navbar</h4>

        <nav>
          <ul>
            <li>
              
              <NavLink className="nav-link" to="games" onClick={(event) => {const canvases = document.querySelectorAll('canvas'); canvases.forEach(canvas => { canvas.remove(); navigate(`/games`); });}}>                
              <>󰊖 Games    </>
              </NavLink>
              </li>
              <li>
              <NavLink className="nav-link" to="chat" onClick={(e) => { document.querySelector(".navbar").style.position = "unset"; }}>  
              <>󰭻 Chat      </>
              </NavLink>
              </li>
              <li>

              <NavLink className="nav-link" to="/Settings">  
              <> Settings   </>
              </NavLink>
              </li>



          </ul>
        </nav>
            
      </div>
      

    </section>
  );
}