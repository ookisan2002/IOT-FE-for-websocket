import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
const Sidebar=({getData,setGetData})=>{
    // Lấy URL từ trình duyệt hoặc bất kỳ nguồn nào khác
    // var url = "http://localhost:3000/sensor#";
    // var linkPart = url.match(/#(.*)/)[1];
    // console.log(linkPart);
    const [currentPage,setCurrentPage]=useState('');
    const navigate=useNavigate()
    useEffect(() => {
        const socket = new SockJS('http://IOT-BE-ws-deploy2-dev.ap-southeast-1.elasticbeanstalk.com/ws');
        stompClient= over(socket);
        // Cleanup - Đóng kết nối khi component unmount
        return () => {
            socket.close();
        };
      }, []);
    const changePage=(page)=>{
        if(page === 'sensor'){
            stompClient.send("/app/sensorData", {}, '1');
        }else if(page ==='history'){
            stompClient.send("/app/history", {}, '1');
        }
        navigate(`/${page}`);
        setCurrentPage(page)
    }
    useEffect(function (){
        // Lấy URL hiện tại
        var currentURL = window.location.href;

        // Lấy phần cuối cùng của đường link (đường dẫn sau ký tự '#')
        var hashIndex = currentURL.lastIndexOf("/");
        var sensorPart = currentURL.substring(hashIndex + 1,currentURL.length-1);
        console.log(sensorPart)
        setCurrentPage(sensorPart)
    },[])
    return (
        <div className="sidebar relative">
            <a href="#" className="logo">
                <i className='bx bx-code-alt'></i>
                <div className="logo-name"><span>Ooki</span>San</div>
            </a>
            <ul className="side-menu">
                <li onClick={()=>{changePage('')}} className={`${currentPage==''?'active':''} ${currentPage=='/'?'active':''}`}><a href="#"><i className='bx bxs-dashboard'></i>Dashboard</a></li>
                <li onClick={()=>{changePage('sensor')}} className={`${currentPage=='sensor'?'active':''}`}><a href="#"><i className='bx bxs-data'></i>Sensor Data</a></li>
                <li onClick={()=>{changePage('history')}} className={`${currentPage=='history'?'active':''}`}><a href="#"><i className='bx bx-history'></i>History</a></li>
                <li onClick={()=>{changePage('profile')}} className={`${currentPage=='profile'?'active':''}`}><a href="#"><i className='bx bxs-user-circle'></i>Profile</a></li>
            </ul>
            <div className="!mt-64 flex items-center justify-center">
                <h3 className="mr-3">Connection:</h3>
                <div className="toggle-switch relative" >
                    <input className="toggle-input" id="toggle" type="checkbox" checked={getData}  onClick={()=>{setGetData((prevGetData)=>!prevGetData)}}/>
                    <label className="toggle-label" title="Turn switch on to connect to device" for="toggle"></label>
                </div>
            </div>
        </div>
    )
}
export default Sidebar;