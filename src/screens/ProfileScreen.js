import React from "react";
import { useSelector } from "react-redux";
import { selectcurrentUser } from "../features/currentUserSlice";
import Nav from "../Nav";
import "./ProfileScreen.css";
import { signOut } from "firebase/auth";
import { auth } from '../firebase'
import PlansScreen from './PlansScreen'
import { useNavigate } from "react-router-dom";

const ProfileScreen = () => {
    const currentUser = useSelector(selectcurrentUser)
    const navigate = useNavigate();

  return (
    <div className="profileScreen">
      <Nav />
      <div className="profileScreen__body">
        <h1>Edit Profile</h1>
        <div className="profileScreen__info">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="profile"
          />
          <div className="profileScreen__details">
              <h2>{currentUser?.email}</h2>
              <div className="profileScreen__plans">
              <h3>Plans</h3>

              <PlansScreen />

              {currentUser ? <button onClick={() => signOut(auth)} className="profileScreen__signOut">Sign Out</button>:
               <button className="profileScreen__SignUp" onClick={() => navigate('/login')}>Sign Up</button>}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
