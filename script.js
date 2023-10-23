// Access all the required HTML elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

// Weather Div
const userContainer = document.querySelector(".weather-container");
// Grant Location Element
const grantAccessContainer = document.querySelector(".grant-location-container");
// Access the Form
const searchForm = document.querySelector(".form-container");
// Access loading Container
const loadingScreen = document.querySelector(".loading-container");
// Access the main user infoo container
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
// search field input element
const searchInput = document.querySelector("[data-searchInput]");
// Error container
const errorContainer = document.querySelector(".error-container");

// current Tab variable
let currentTab = userTab; // by default, your weather is the default tab
// API Key
const API_KEY = "168771779c71f3d64106d8a88376808a";
// When the current tab is selected, add the folllwoing properties which will show that the tab is selected
currentTab.classList.add("current-tab");
// When the page loads for the first time, call the get from session storage
getFromSessionStorage();

function switchTab(clickedTab){
    if(currentTab != clickedTab){
        // Remove the background color from the current tab
        currentTab.classList.remove("current-tab");
        // change the current tab
        currentTab = clickedTab;
        // add the bg color to the new tab
        currentTab.classList.add("current-tab");

        // When we are switching to the Search Weather Tab
        // Remoce
        if(!searchForm.classList.contains("active")){
            // Remove the Your Weather Tab's info
            userInfoContainer.classList.remove("active");
            // remove the grant Access Info
            grantAccessContainer.classList.remove("active");
            // Display the Search Weather Info form
            searchForm.classList.add("active");
            errorContainer.classList.remove("active");
        }
        else{
            // We are switching from search tab to Your Weather Tab
            searchForm.classList.remove("active");
            // Search Class's info should be removed
            userInfoContainer.classList.remove("active");
            errorContainer.classList.remove("active");
            // Get the current location's info
            // We will search the local storage first for the present co-ordinates
            getFromSessionStorage();
        }
    }
}

// Listen for click events on the two tabs
userTab.addEventListener("click", ()=>{
    switchTab(userTab); // pass that tab which has been clicked
})
searchTab.addEventListener("click", ()=>{
    switchTab(searchTab); // pass that tab which has been clicked
})

// Cheks if location is present in the session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // If local coordinates are not  present, we will have to show grant location infi
        grantAccessContainer.classList.add("active");
    }
    else{
        // Using the present location, fetch the weather info
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // remove the grant access container
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // API Call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        // Remove the loading screen once the data is fetchded
        loadingScreen.classList.remove("active");
        // Display the Weather Info
        userInfoContainer.classList.add("active");
        // Render the Weather Info
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}

// Set Info into the HTML elements from the response
function renderWeatherInfo(weatherInfo){
    // Get Elements into which we need to put the data
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from the response JSON and parse it into the HTML elements
    // ?. -> Optional Chaining
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    } 
    // store the location in a session storage variable
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

    // fetch the weather info
    fetchUserWeatherInfo(userCoordinates);
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{

    }
}

// If we do not have access to user's location, get the location
grantAccessButton.addEventListener("click", getLocation);

// Get the city name from user
searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName == ""){
        return;
    }
    else{
        // Fetch weather based on the city name
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    // Add loading screen while fetching the weather info and remove userInfoContainer
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();

    // Invalid field entered
    if(data.cod == 404){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
    }
    else{
        errorContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
}