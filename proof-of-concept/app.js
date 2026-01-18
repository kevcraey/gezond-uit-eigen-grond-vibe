/**
 * Gezond Grond Tool - Application Logic
 * Departement Omgeving Vlaanderen
 */

class GezondGrondApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.map = null;
        this.marker = null;
        this.userAddress = null;
        this.userCoordinates = null;
        this.answers = {
            materialen: null,
            asbest: null,
            oliegeur: null,
            verbranden: null,
            pesticiden: null
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgressBar();
        this.updateNavButtons();
    }
    
    bindEvents() {
        // Address search
        document.getElementById('searchAddress').addEventListener('click', () => this.searchAddress());
        document.getElementById('address').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAddress();
        });
        document.getElementById('address').addEventListener('input', (e) => this.handleAddressInput(e));
        
        // Confirm address
        document.getElementById('confirmAddress').addEventListener('click', () => this.confirmAddress());
        
        // Navigation
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());
        
        // Recommendations
        document.getElementById('showRecommendation2').addEventListener('click', () => this.showRecommendation(2));
        document.getElementById('showRecommendation3').addEventListener('click', () => this.showRecommendation(3));
        document.getElementById('showRecommendation4').addEventListener('click', () => this.showRecommendation(4));
        
        // Radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleRadioChange(e));
        });
        
        // Request samples button
        document.getElementById('requestSamples')?.addEventListener('click', () => {
            alert('Dit zou doorverwijzen naar de bodemstalen aanvraag pagina.');
        });
    }
    
    async handleAddressInput(e) {
        const query = e.target.value;
        const suggestionsEl = document.getElementById('address-suggestions');
        
        if (query.length < 3) {
            suggestionsEl.classList.remove('active');
            return;
        }
        
        try {
            const results = await this.geocodeAddress(query);
            if (results.length > 0) {
                suggestionsEl.innerHTML = results.slice(0, 5).map(result => 
                    `<div class="suggestion-item" data-lat="${result.lat}" data-lon="${result.lon}" data-name="${result.display_name}">
                        ${result.display_name}
                    </div>`
                ).join('');
                
                suggestionsEl.classList.add('active');
                
                // Bind click events
                suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        document.getElementById('address').value = item.dataset.name;
                        this.userCoordinates = {
                            lat: parseFloat(item.dataset.lat),
                            lon: parseFloat(item.dataset.lon)
                        };
                        this.userAddress = item.dataset.name;
                        suggestionsEl.classList.remove('active');
                        this.showMapConfirmation();
                    });
                });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    }
    
    async searchAddress() {
        const address = document.getElementById('address').value;
        
        if (!address || address.length < 3) {
            alert('Vul een geldig adres in');
            return;
        }
        
        try {
            const results = await this.geocodeAddress(address);
            
            if (results.length > 0) {
                const result = results[0];
                this.userCoordinates = {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon)
                };
                this.userAddress = result.display_name;
                this.showMapConfirmation();
            } else {
                alert('Adres niet gevonden. Probeer een ander adres.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Er is een fout opgetreden bij het zoeken. Probeer opnieuw.');
        }
    }
    
    async geocodeAddress(query) {
        // Use Nominatim for geocoding (OpenStreetMap)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=be&limit=5`;
        
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'nl'
            }
        });
        
        return await response.json();
    }
    
    showMapConfirmation() {
        const confirmSection = document.getElementById('address-confirm');
        const addressDisplay = document.getElementById('confirmed-address');
        
        confirmSection.classList.remove('hidden');
        addressDisplay.textContent = this.userAddress;
        
        // Initialize or update map
        if (!this.map) {
            this.initMap();
        } else {
            this.updateMap();
        }
        
        // Scroll to map
        confirmSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    initMap() {
        this.map = L.map('map').setView([this.userCoordinates.lat, this.userCoordinates.lon], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        this.marker = L.marker([this.userCoordinates.lat, this.userCoordinates.lon], {
            draggable: true
        }).addTo(this.map);
        
        // Update coordinates when marker is dragged
        this.marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            this.userCoordinates = {
                lat: pos.lat,
                lon: pos.lng
            };
        });
    }
    
    updateMap() {
        this.map.setView([this.userCoordinates.lat, this.userCoordinates.lon], 17);
        this.marker.setLatLng([this.userCoordinates.lat, this.userCoordinates.lon]);
    }
    
    confirmAddress() {
        if (!this.userCoordinates) {
            alert('Zoek eerst een adres op.');
            return;
        }
        
        // Show success message
        const confirmSection = document.getElementById('address-confirm');
        confirmSection.innerHTML += `
            <div class="tag tag-green" style="margin-top: 1rem;">
                ✓ Adres bevestigd
            </div>
        `;
        
        // Enable next step
        document.getElementById('nextStep').disabled = false;
    }
    
    handleRadioChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.answers[name] = value;
    }
    
    showRecommendation(step) {
        const recommendationEl = document.getElementById(`recommendation${step}`);
        let content = '';
        
        switch(step) {
            case 2:
                content = this.getMaterialenRecommendation();
                break;
            case 3:
                content = this.getAsbestRecommendation();
                break;
            case 4:
                content = this.getBodemverontreinigingRecommendation();
                break;
        }
        
        recommendationEl.innerHTML = content;
        recommendationEl.classList.remove('hidden');
        recommendationEl.scrollIntoView({ behavior: 'smooth' });
    }
    
    getMaterialenRecommendation() {
        const value = this.answers.materialen;
        
        if (!value) {
            return '<p>Selecteer eerst een optie hierboven.</p>';
        }
        
        const recommendations = {
            geen: {
                status: 'green',
                title: 'Geen bodemvreemde materialen',
                text: 'Er zijn geen indicaties van bodemvreemde materialen gevonden. U kunt doorgaan met uw moestuin of kippenren.'
            },
            beperkt: {
                status: 'orange',
                title: 'Beperkte hoeveelheid materialen',
                text: 'Er is een beperkte hoeveelheid bodemvreemde materialen aanwezig. Overweeg om de bovenste laag te vervangen of een verhoogde bak te gebruiken.'
            },
            assen: {
                status: 'red',
                title: 'Assen aangetroffen (PAK, ZM)',
                text: 'Assen kunnen polycyclische aromatische koolwaterstoffen (PAK) en zware metalen bevatten. Een bodemanalyse wordt sterk aanbevolen voordat u groenten teelt.'
            },
            asbest: {
                status: 'red',
                title: 'Asbestresten aangetroffen',
                text: 'Asbest is gevaarlijk voor de gezondheid. Neem contact op met een erkende asbestdeskundige voordat u verdere stappen onderneemt.'
            },
            veel: {
                status: 'red',
                title: 'Veel materialen aangetroffen',
                text: 'Een grote hoeveelheid bodemvreemde materialen kan wijzen op ernstige verontreiniging. Een professionele bodemanalyse is noodzakelijk.'
            }
        };
        
        const rec = recommendations[value];
        return `
            <div class="result-item">
                <h4><span class="tag tag-${rec.status}">${rec.title}</span></h4>
                <p>${rec.text}</p>
            </div>
        `;
    }
    
    getAsbestRecommendation() {
        const value = this.answers.asbest;
        
        if (!value) {
            return '<p>Selecteer eerst een optie hierboven.</p>';
        }
        
        if (value === 'ja') {
            return `
                <div class="result-item">
                    <h4><span class="tag tag-red">Asbest aanwezig</span></h4>
                    <p>Asbesthoudende materialen in de buurt van uw moestuin of kippenren kunnen een gezondheidsrisico vormen. 
                    Het water dat van asbesthoudende daken afloopt kan vezels bevatten. Overweeg om:</p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>De moestuin te verplaatsen</li>
                        <li>Een afscherming te plaatsen</li>
                        <li>De asbesthoudende materialen te laten verwijderen door een erkende firma</li>
                    </ul>
                </div>
            `;
        } else {
            return `
                <div class="result-item">
                    <h4><span class="tag tag-green">Geen asbest</span></h4>
                    <p>Er zijn geen indicaties van asbesthoudende materialen. U kunt doorgaan met uw plannen.</p>
                </div>
            `;
        }
    }
    
    getBodemverontreinigingRecommendation() {
        const { oliegeur, verbranden, pesticiden } = this.answers;
        let recommendations = [];
        
        if (oliegeur === 'ja') {
            recommendations.push({
                status: 'red',
                title: 'Opslagtanks/oliegeur',
                text: 'Olieproducten kunnen de bodem verontreinigen. Laat een bodemonderzoek uitvoeren voordat u groenten teelt.'
            });
        } else if (oliegeur === 'neen') {
            recommendations.push({
                status: 'green',
                title: 'Opslagtanks/oliegeur',
                text: 'Geen indicaties van olievervuiling.'
            });
        }
        
        if (verbranden === 'ja') {
            recommendations.push({
                status: 'orange',
                title: 'Verbranden van afval',
                text: 'Verbranding kan schadelijke stoffen in de bodem achterlaten. Vermijd teelt op plaatsen waar regelmatig is gestookt.'
            });
        } else if (verbranden === 'neen') {
            recommendations.push({
                status: 'green',
                title: 'Verbranden van afval',
                text: 'Geen indicaties van verbrandingsactiviteiten.'
            });
        }
        
        if (pesticiden === 'ja') {
            recommendations.push({
                status: 'orange',
                title: 'Pesticiden',
                text: 'Historisch pesticidengebruik kan residuen achterlaten. Overweeg een bodemanalyse voor uw gemoedsrust.'
            });
        } else if (pesticiden === 'neen') {
            recommendations.push({
                status: 'green',
                title: 'Pesticiden',
                text: 'Geen indicaties van pesticidengebruik.'
            });
        }
        
        if (recommendations.length === 0) {
            return '<p>Beantwoord eerst de vragen hierboven.</p>';
        }
        
        return recommendations.map(rec => `
            <div class="result-item">
                <h4><span class="tag tag-${rec.status}">${rec.title}</span></h4>
                <p>${rec.text}</p>
            </div>
        `).join('');
    }
    
    nextStep() {
        if (this.currentStep === 1 && !this.userCoordinates) {
            alert('Bevestig eerst uw adres voordat u verdergaat.');
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            // Show results
            this.showResults();
        }
        
        this.updateProgressBar();
        this.updateNavButtons();
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
        
        this.updateProgressBar();
        this.updateNavButtons();
    }
    
    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Show current step
        const stepEl = document.getElementById(`step${step}`);
        if (stepEl) {
            stepEl.classList.remove('hidden');
            stepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    showResults() {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Show results
        const resultsEl = document.getElementById('results');
        resultsEl.classList.remove('hidden');
        
        // Populate results
        document.getElementById('result-address').textContent = this.userAddress || 'Geen adres opgegeven';
        
        // Generate address-based results (simulated)
        document.getElementById('address-results').innerHTML = this.getAddressBasedResults();
        
        // Generate materials results
        document.getElementById('materialen-results').innerHTML = this.getMaterialenRecommendation();
        
        // Generate full results
        document.getElementById('full-results').innerHTML = this.getFullResults();
        
        // Update nav button
        document.getElementById('nextStep').classList.add('hidden');
        
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    getAddressBasedResults() {
        // Simulated results based on address
        // In production, these would come from actual data sources
        return `
            <div class="result-item">
                <h4><span class="tag tag-blue">Onbekend</span> waterloop lang perceel en/of in fluviaal overstromingsgebied</h4>
                <p>Je tuin ligt langs een waterloop, eventuyl het kritiseren van een moestuin, fruitplanten of kippenren in de 5 m zone lange de waterloop.</p>
            </div>
            <div class="result-item">
                <h4><span class="tag tag-green">Veilig</span> Ligt je terrein naast een drukke weg of spoorweg?</h4>
                <p>Je adres is gelegen dan 60 meter van een drukke weg (autosnelweg) of de bron of spoorweg, weg bueven een enkele busbrite dan oven.</p>
            </div>
            <div class="result-item">
                <h4><span class="tag tag-orange">Aandacht</span> Ligt je grond in de nabijheid van een brandweerkazerne/teflon of een PFAS no regret zone</h4>
                <p>Je adres ligt mogelijk in de buurt van een PFAS-bron. Raadpleeg de PFAS-viewer voor meer informatie.</p>
            </div>
            <div class="result-item">
                <h4><span class="tag tag-blue">Onbekend</span> Werden er activiteiten uitgevoerd die bodemverontreiniging kunnen veroorzaken?</h4>
                <p>We hebben geen informatie over industriële activiteiten in uw omgeving.</p>
            </div>
        `;
    }
    
    getFullResults() {
        return this.getAsbestRecommendation() + this.getBodemverontreinigingRecommendation();
    }
    
    updateProgressBar() {
        // Update step circles
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Update progress lines
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            const lineNum = index + 1;
            line.classList.remove('active', 'completed');
            
            if (lineNum < this.currentStep) {
                line.classList.add('completed');
            } else if (lineNum === this.currentStep) {
                line.classList.add('active');
            }
        });
    }
    
    updateNavButtons() {
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        
        // Show/hide prev button
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
        // Update next button text
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = 'Bekijk resultaten →';
        } else if (this.currentStep === 1) {
            nextBtn.textContent = 'Volgende stap: Doe de test →';
        } else {
            nextBtn.textContent = 'Volgende stap →';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GezondGrondApp();
});
