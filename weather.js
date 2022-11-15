const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const datetimeE1 = document.getElementById('date-container');
const linechart = document.getElementById("chart");
var myInterval;

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY ='49cc8c821cd2aff9af04c9f98c36eb74'; 


function interval(data2){
    clearInterval(myInterval);
myInterval = setInterval(() => {
    const month = Number(data2.datetime.slice(5,7));
    const date = Number(data2.datetime.slice(8,10));
    const day = Number(data2.day_of_week);
    const hour = Number(data2.datetime.slice(11,13));
    const hoursIn12HrFormat = hour >= 13 ? hour %12: hour
    const minutes = Number(data2.datetime.slice(14,16));
    const ampm = hour >=12 ? 'PM' : 'AM'
    var timesetting = (hoursIn12HrFormat < 10? '0'+hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10? '0'+minutes: minutes);
    console.log(timesetting);
    datetimeE1.innerHTML = `<div class="time" id="time">${timesetting}<span id="am-pm">${ampm}</span></div>
                        <div class="date" id="date">${(days[day] + ', ' + date+ ' ' + months[month])}</div>`;

}, 1000);
}


// function to get time at the particular time zone
function getTime(data){
    fetch(`http://worldtimeapi.org/api/timezone/${data.timezone}`).then(res => res.json()).then(data2 => {
    
            console.log(data2);
            interval(data2);
            })

}


// function to display default Delhi
function DefaultScreen(){
    document.getElementById("search").defaultValue = "Delhi";
    GetInfo();
}


// function to get data of the specified city
function GetInfo() {

    var newName = document.getElementById("search");

fetch('https://api.openweathermap.org/data/2.5/forecast?q='+newName.value+'&appid=32ba0bfed592484379e51106cef3f204')
.then(response => response.json())
.then(data1 => {

    console.log(data1);
    let latitude = data1.city.coord.lat;
    let longitude = data1.city.coord.lon;
    timezone.innerHTML = data1.city.name;

        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=32ba0bfed592484379e51106cef3f204`).then(res => res.json()).then(data => {

        console.log(data)
        getTime(data);
        showWeatherData(data);
        })
    

})
.catch(err => console.log(err))
}

getWeatherData()
//fucntion to get data of the location of user
function getWeatherData () {
    navigator.geolocation.getCurrentPosition((success) => {
        
        let {latitude, longitude } = success.coords;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

        console.log(data)
        timezone.innerHTML = "Timezone: "+data.timezone;
        showWeatherData(data);
        getTime(data);
        })
    })
}

function showWeatherData (data){
  let {humidity, sunrise, sunset, wind_speed} = data.current;

     countryEl.innerHTML = data.lat + 'N ' + data.lon+'E';
     currentWeatherItemsEl.innerHTML = 
    `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
    </div>
    <div class="weather-item">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item">
        <div>Sunset</div>
        <div>${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>
     `;
    
    let otherDayForcast = ''
    var yValues = [];
    data.daily.forEach((day, idx) => {
        
        yValues.push(day.temp.day);
        if(idx == 0){
            currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
            <div class="other">
                <div class="day">${window.moment(day.dt*1000).format('dddd')}</div>
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>`
        }
        else{
            
            otherDayForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>`
        }
    })

linechart.innerHTML = `<canvas id="myChart" style="max-height: 200px;"></canvas>`
    // line chart
    var xValues = days;

    new Chart("myChart", {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
        borderColor:"white",
        data: yValues
        }]
    },
    options: {
        legend: {
            display: false,
            labels: {
                fontColor: "white",
                fontSize: 30,
                fontWeight: 50
            }
        },
        title: {
        display: true,
        text: "Weekly Weather",
        fontColor: "white"
        },
        responsive: true,
        scales: {
            xAxes: [{ 
                ticks: {
                  fontColor: "white",
                },
            }],
            yAxes: [{ 
                gridLines: {
                    display: true,
                },
                ticks: {
                  fontColor: "white",
                }, 
            }],

        }
    },
    grid: {
        color: "white"
    }
    });
    weatherForecastEl.innerHTML = otherDayForcast;
}
