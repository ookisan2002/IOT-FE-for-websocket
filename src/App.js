import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sidebar from './Component/Sidebar';
import History from './pages/History';
import Profile from './pages/Profile';
import SensorData from './pages/SensorData';
import { useEffect, useState } from 'react';
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

function App() {
  const [dataSensor,setDataSensor]=useState([{temperature:0,humidity:0,dust:0,light:0}]);
  const [historyData, setHistoryData] = useState([]);
  const [sensorData,setSensorData]=useState([]);
  const [getData,setGetData] = useState(false);
  useEffect(() => {
    const onConnected = () => {
        stompClient.subscribe('/sensor/dashboard', onMessageReceivedForDashboard);
        stompClient.subscribe('/sensor/history', onMessageReceivedForHistory);
        stompClient.subscribe('/sensor/sensorData', onMessageReceivedForSensorData);
        stompClient.send("/app/history", {}, '1');
        stompClient.send("/app/sensorData", {}, '1');
        // console.log('ok');
    }
    const onMessageReceivedForDashboard = (payload)=>{
      const jsonObject = JSON.parse(payload.body);
      setDataSensor(jsonObject);
    }
    const onMessageReceivedForHistory = (payload)=>{
      const jsonObject = JSON.parse(payload.body);
      var solvedArray=jsonObject.map((data_change, index) => {
        return {
            'ID': index + 1,
            'Sensor': 'Sensor 1',
            'Device': data_change.device,
            'Date': data_change.time_change.split(' ')[0],
            'Time': data_change.time_change.split(' ')[1],
            'Information': `${data_change.data_change === 1 ? 'Turn on' : 'Turn off'}`
          }
        })
      setHistoryData(solvedArray);
    }
    const onMessageReceivedForSensorData = (payload)=>{
      const jsonObject = JSON.parse(payload.body);
      var solvedArray = jsonObject.map((data_sensor,index)=>{
        return {
          'ID': index+1,
          'Sensor': 'Sensor 1',
          'Temperature': data_sensor.temperature,
          'Humidity': data_sensor.humidity,
          'Dust': data_sensor.dust,
          'Light': data_sensor.light,
          'Date': data_sensor.time.split(' ')[0],
          'Time': data_sensor.time.split(' ')[1]
        }
      })
      setSensorData(solvedArray)
    }
    const onError = (err) => {
        console.log(err);
    }
    const socket = new SockJS('http://IOT-BE-ws-deploy2-dev.ap-southeast-1.elasticbeanstalk.com/ws');
    stompClient= over(socket);
    stompClient.connect({},onConnected, onError);
    // Cleanup - Đóng kết nối khi component unmount
    return () => {
        socket.close();
    };
  }, []);
  useEffect(()=>{
      let sendMes=undefined;
      if(getData){
        stompClient.send("/app/dashboard", {}, '1');
        sendMes=setInterval(()=>{
          stompClient.send("/app/dashboard", {}, '1');
        },2100)
      }
      return ()=>{
        if(typeof sendMes !== "undefined")
          clearInterval(sendMes);
        }
  },[getData])
  return (
    <div className="App  w-full h-full flex">
      <Sidebar
        getData={getData}
        setGetData={setGetData}
      />
      <Routes>
        <Route path="/sensor" element={<SensorData solvedArray={sensorData}/>} />
        <Route path="/history" element={<History solvedArray={historyData}/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Dashboard dataSensor={dataSensor} />} />
      </Routes>
    </div>
  );
}

export default App;
