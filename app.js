const btn = document.querySelector('.footer__btn');
const flagsContainer = document.querySelector('.flags');

const API_KEY = '239239665271020643383x30795';

const sound = new Audio();
sound.src = 'snd.mp3';

document.addEventListener('click', function (e) {
  // console.log(e);
  const flag = e.target.closest('.flag');
  if (flag) {
    sound.play();
    if (flag.classList.contains('active')) {
      flag.classList.remove('active');
    } else {
      flag.classList.add('active');
      setTimeout(function () {
        flagsContainer.querySelectorAll('.flag').forEach(function (f) {
          if (f !== flag && f.classList.contains('active')) {
            f.classList.remove('active');
            sound.currentTime = 0;
            sound.play();
          }
        });
      }, 300);
    }
  } else {
    flagsContainer.querySelectorAll('.flag').forEach(function (f) {
      if (f.classList.contains('active')) {
        f.classList.remove('active');
        sound.currentTime = 0;
        sound.play();
      }
    });
  }
});

btn.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(
    function ({ coords: { latitude, longitude } }) {
      // console.log(latitude, longitude);
      displayCountryByGPS(latitude, longitude);
    },
    function () {
      displayCountryByGPS(55.75, 37.62);
    }
  );
});

async function displayCountryByGPS(lat, lng) {
  const response = await fetch(
    `https://geocode.xyz/${lat},${lng}?geoit=json&auth=${API_KEY}`
  );
  // console.log(response);
  if (!response.ok) return;
  const info = await response.json();
  // console.log(info);
  getCountryData(info.country.toLowerCase());
}

function getCountryData(country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(function (response) {
      if (!response.ok) throw 'Error!!!';
      return response.json();
    })
    .then(function ([data]) {
      console.log(data);
      displayCountry(data);
      return data.borders;
    })
    .then(function (borders) {
      // console.log(borders);
      if (!borders)
        flagsContainer.insertAdjacentHTML('beforeend', 'Нет соседей');
      else {
        return Promise.all(
          borders.map(function (border) {
            return fetch(`https://restcountries.com/v3.1/alpha/${border}`);
          })
        );
      }
    })
    .then(function (responses) {
      return Promise.all(
        responses.map(function (r) {
          return r.json();
        })
      );
    })
    .then(function (countries) {
      // console.log(countries);
      countries.forEach(function ([c]) {
        displayCountry(c, true);
      });
    });
}

function displayCountry(data, neighbour = false) {
  const html = `
		<div class="flag ${neighbour ? 'flag-neighbour' : ''}">
			<div class="flag__front">
				<img
					class="flag__img"
					src="${data.flags.png}" />
				<h3 class="country__name">${data.name.common}</h3>
			</div>
			<div class="flag__back">
				<h3 class="country__name">${data.name.common}</h3>
				<h4 class="country__region">${data.region}</h4>
				<div class="country__info-img">&#128106;</div>
				<p class="country__info">${(data.population / 1000000).toFixed(1)} million</p>
				<div class="country__info-img">&#128539;</div>
				<p class="country__info">${Object.values(data.languages).join('<br/>')}</p>
				<div class="country__info-img">&#128181;</div>
				<p class="country__info">${Object.values(data.currencies)
          .map(function (c) {
            return `${c.symbol}: ${c.name}`;
          })
          .join('<br/>')}</p>
			</div>
		</div>
	`;
  // console.log(html);
  flagsContainer.insertAdjacentHTML('beforeend', html);
}
