import React from "react";
import "@/styles/Navbar.css";

export default class NavbarLogin extends React.Component {
    render() {
        return ( 
            <div className="flex items-center bg-indigo-950 h-17 p-5">
                <p className="logo text-4xl text-white">GSW</p>
            </div>
        )
    }
}