const $ = selector => {
    return document.querySelector(selector);
};

const $$ = selector => {
    return document.querySelectorAll(selector);
};

function init() {
    displayData();
    initEvents();
}

function initEvents() {
    $("form").addEventListener("submit", e => {
        e.preventDefault();
        displayData();
    });

    $("#searchBtn").addEventListener("click", e => {
        e.preventDefault();
        displayData();
    });

    $(".unitContainer").addEventListener("click", e => {
        switchUnit($(".unitContainer"));
    });
}

async function getData() {
    const loc = $("input").value || "mangalia";
    const response = await fetch(`https://weatherdbi.herokuapp.com/data/weather/${loc}`);
    const data = await response.json();
    return data;
}

function displayData() {
    const unit = $(".unitContainer").dataset.unit;
    $(".loader").style.display = "flex";
    getData().then(data => {
        if (data.status === "fail") {
            $(".loader").style.display = "none";
            alert(`${data.query} nu este o locatie valida !`);
            return;
        }
        sessionStorage.setItem("meteoData", JSON.stringify(data));
        displayHeader(data, unit);
        displayCards(data.next_days, unit);
        $(".loader").style.display = "none";
    });
}

function displayHeader({ region, currentConditions: { comment, humidity, iconURL, precip, temp } }, unit) {
    $(".conditionIcon").src = iconURL;
    $(".region").innerHTML = region;
    $(".condition").innerHTML = comment;
    $(".temperature").innerHTML = `${temp[unit]} ${unit === "f" ? "℉" : "℃"}`;
    $(".humidity").innerHTML = `${humidity} humidity`;
}

function displayCards(nextDays, unit) {
    let cardsHTML = "";
    nextDays.forEach(day => {
        cardsHTML += createCard(day, unit);
    });
    $(".cardsContainer").innerHTML = cardsHTML;
}

function createCard({ day, comment, max_temp, min_temp, iconURL }, unit) {
    return `
    <div class="card">
        <h3 class="day">${day}</h3>
        <div class="cardData">
            <img src="${iconURL}" alt="" />
            <h4>${comment}</h4>
            <p class="temp">${max_temp[unit]}${unit === "f" ? "℉" : "℃"} / ${min_temp[unit]}${unit === "f" ? "℉" : "℃"}</p>
        </div>
    </div>
    `;
}

function switchUnit(element) {
    element.dataset.switch++;
    let unit;
    if (element.dataset.switch % 2 === 0) {
        element.classList.remove("cUnit");
        element.classList.add("fUnit");
        unit = "f";
    } else {
        element.classList.remove("fUnit");
        element.classList.add("cUnit");
        unit = "c";
    }
    element.dataset.unit = unit;
    const sessionData = JSON.parse(sessionStorage.getItem("meteoData"));
    displayHeader(sessionData, unit);
    updateTemp(sessionData.next_days, unit);
}

function updateTemp(next_days, unit) {
    next_days.forEach((day, index) => {
        $$(".temp")[index].innerText = `${day.max_temp[unit]}${unit === "f" ? "℉" : "℃"} / ${day.min_temp[unit]}${unit === "f" ? "℉" : "℃"}`;
    });
}

init();
