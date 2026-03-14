import '../../../styles/ProductTitle.css'
import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function ProductTitle({ Name, Category, Price}) {
    return(
        <div className="Title">
            <h1>{Name}</h1>
            <p>{Category}</p>
            <p>${Price}</p>
        </div>
    )
}