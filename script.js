const hospitals = [
  {
    id: 1,
    name: 'Hospital Santa Clara',
    city: 'São Paulo',
    lat: -23.5621,
    lng: -46.6534,
    rating: 4.9,
    emergency: true,
    specialties: ['Cardiologia', 'Urgência', 'Pediatria'],
    distanceLabel: '3,2 km',
    description: 'Atendimento completo com pronto atendimento e especialistas 24 horas.'
  },
  {
    id: 2,
    name: 'MediCenter Saúde Premium',
    city: 'São Paulo',
    lat: -23.5487,
    lng: -46.6344,
    rating: 4.8,
    emergency: false,
    specialties: ['Clínica Geral', 'Ortopedia', 'Neurologia'],
    distanceLabel: '4,6 km',
    description: 'Consultas rápidas, exames diagnósticos e suporte de alta qualidade.'
  },
  {
    id: 3,
    name: 'Vida Nova Hospital',
    city: 'Rio de Janeiro',
    lat: -22.9139,
    lng: -43.1729,
    rating: 4.9,
    emergency: true,
    specialties: ['Oncologia', 'Urologia', 'Trauma'],
    distanceLabel: '2,9 km',
    description: 'Estrutura moderna com atendimento de urgência e equipe multidisciplinar.'
  },
  {
    id: 4,
    name: 'Centro Diagnóstico Azul',
    city: 'Belo Horizonte',
    lat: -19.9167,
    lng: -43.9345,
    rating: 4.7,
    emergency: false,
    specialties: ['Exames', 'Endocrinologia', 'Ginecologia'],
    distanceLabel: '5,1 km',
    description: 'Diagnósticos precisos e atendimento personalizado para toda a família.'
  },
  {
    id: 5,
    name: 'Clinica Saúde Mais',
    city: 'Curitiba',
    lat: -25.4296,
    lng: -49.2719,
    rating: 4.8,
    emergency: true,
    specialties: ['Pediatria', 'Dermatologia', 'Vacinas'],
    distanceLabel: '4,3 km',
    description: 'Foco em prevenção, bem-estar e cuidado com a saúde integral da família.'
  },
  {
    id: 6,
    name: 'Hospital Porto Seguro',
    city: 'Recife',
    lat: -8.0476,
    lng: -34.877,
    rating: 4.9,
    emergency: true,
    specialties: ['Cardiologia', 'Obstetrícia', 'Cirurgia'],
    distanceLabel: '3,7 km',
    description: 'Especialistas renomados e apoio completo para emergências e internações.'
  }
];

const cityCoordinates = {
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'belo horizonte': { lat: -19.9167, lng: -43.9345 },
  'curitiba': { lat: -25.4284, lng: -49.2733 },
  'recife': { lat: -8.0476, lng: -34.877 },
  'brasilia': { lat: -15.7939, lng: -47.8828 }
};

const hospitalList = document.getElementById('hospitalList');
const resultsStatus = document.getElementById('resultsStatus');
const distanceSummary = document.getElementById('distanceSummary');
const cityInput = document.getElementById('cityInput');
const rangeSelect = document.getElementById('rangeSelect');
const useLocationBtn = document.getElementById('useLocationBtn');
const searchBtn = document.getElementById('searchBtn');
const findHospitalsBtn = document.getElementById('findHospitalsBtn');

function toRad(value) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function getHospitalsByLocation(lat, lng, maxDistanceKm = 20) {
  const nearby = hospitals
    .map((hospital) => ({
      ...hospital,
      distance: getDistanceInKm(lat, lng, hospital.lat, hospital.lng)
    }))
    .filter((hospital) => hospital.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby.length ? nearby : hospitals
    .map((hospital) => ({
      ...hospital,
      distance: getDistanceInKm(lat, lng, hospital.lat, hospital.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
}

function renderHospitals(items) {
  if (!items.length) {
    hospitalList.innerHTML = '<div class="hospital-card"><p>Nenhum hospital encontrado na sua faixa de busca. Tente ampliar a distância ou outra localização.</p></div>';
    return;
  }

  hospitalList.innerHTML = items
    .map((hospital) => {
      const specialtyText = hospital.specialties.slice(0, 2).join(' • ');
      return `
        <article class="hospital-card">
          <div class="hospital-top">
            <span class="hospital-tag">${hospital.emergency ? 'Urgência' : 'Consulta'}</span>
            <span class="hospital-badge">${hospital.distance.toFixed(1)} km</span>
          </div>

          <h3 class="hospital-name">${hospital.name}</h3>

          <div class="hospital-meta">
            <span class="meta-pill">★ ${hospital.rating}</span>
            <span class="meta-pill">${hospital.city}</span>
            <span class="meta-pill">${specialtyText}</span>
          </div>

          <p>${hospital.description}</p>

          <div class="card-footer">
            <span class="rating">${hospital.distance < 5 ? 'Muito próximo' : 'Boa opção'}</span>
            <button class="card-button" type="button">Agendar</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function updateDistanceSummary(items, cityLabel) {
  if (!items.length) {
    distanceSummary.innerHTML = `
      <span>Melhor opção</span>
      <strong>Sem resultado</strong>
      <small>Refine a busca</small>
    `;
    return;
  }

  const best = items[0];
  distanceSummary.innerHTML = `
    <span>Melhor opção</span>
    <strong>${best.name}</strong>
    <small>${best.distance.toFixed(1)} km de ${cityLabel}</small>
  `;
}

function handleSearch(lat, lng, label, maxDistanceKm) {
  const results = getHospitalsByLocation(lat, lng, maxDistanceKm);
  renderHospitals(results);
  updateDistanceSummary(results, label);
  resultsStatus.textContent = `Melhores opções em ${label} dentro de ${maxDistanceKm} km.`;
}

function resolveSearchByCity() {
  const input = cityInput.value.trim();
  const key = input.toLowerCase();

  if (cityCoordinates[key]) {
    const { lat, lng } = cityCoordinates[key];
    const maxDistance = Number(rangeSelect.value);
    handleSearch(lat, lng, input || 'sua região', maxDistance);
    return;
  }

  const fallback = cityCoordinates['sao paulo'];
  handleSearch(fallback.lat, fallback.lng, 'São Paulo', Number(rangeSelect.value));
  resultsStatus.textContent = 'Cidade não encontrada. Mostrando opções em São Paulo.';
}

function askForLocation() {
  if (!navigator.geolocation) {
    resultsStatus.textContent = 'Geolocalização não suportada neste navegador. Vamos usar a cidade padrão.';
    resolveSearchByCity();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const maxDistance = Number(rangeSelect.value);
      const results = getHospitalsByLocation(latitude, longitude, maxDistance);
      renderHospitals(results);
      updateDistanceSummary(results, 'sua localização');
      resultsStatus.textContent = `Mostrando hospitais mais próximos da sua localização dentro de ${maxDistance} km.`;
    },
    () => {
      resultsStatus.textContent = 'Não foi possível acessar sua localização. Vamos usar a cidade informada.';
      resolveSearchByCity();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

searchBtn.addEventListener('click', resolveSearchByCity);
useLocationBtn.addEventListener('click', askForLocation);
findHospitalsBtn.addEventListener('click', () => {
  document.getElementById('hospitais').scrollIntoView({ behavior: 'smooth', block: 'start' });
  resolveSearchByCity();
});

window.addEventListener('DOMContentLoaded', () => {
  const initial = cityCoordinates['sao paulo'];
  handleSearch(initial.lat, initial.lng, 'São Paulo', Number(rangeSelect.value));
});
