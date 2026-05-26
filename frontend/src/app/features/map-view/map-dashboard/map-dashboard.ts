import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth-service';
import { environment } from '../../../../environments/environment';
import { OlaMaps } from 'olamaps-web-sdk';

@Component({
  selector: 'app-map-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map-dashboard.html',
  styleUrl: './map-dashboard.css',
})
export class MapDashboard implements OnInit, AfterViewInit{
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public authService = inject(AuthService); 

  searchForm!: FormGroup;
  olaMapInstance: any;
  currentMarker: any;
  private olaMapsCore: any; // Stores the main SDK so we can reuse it to create new markers
  poiMarkers: any[] = [];   // Keeps track of the search result pins
  private olaApiKey = environment.olaApiKey;
  private searchSaveUrl = `${environment.apiUrl}/api`

  ngOnInit() {
    this.searchForm = this.fb.group({
      poiType: ['', Validators.required], 
      radius: [2500],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required]
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  async initMap() {
    this.olaMapsCore = new OlaMaps({ apiKey: this.olaApiKey });

    this.olaMapInstance = await this.olaMapsCore.init({
      style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      container: 'ola-map',
      center: [77.61648476788898, 12.93132763567343],
      zoom: 12
    });
    
    this.olaMapInstance.on('click', (event: any) => {
      const longitude = event.lngLat.lng;
      const latitude = event.lngLat.lat;

      this.searchForm.patchValue({ latitude: latitude, longitude: longitude });

      if (this.currentMarker) this.currentMarker.remove();

      // Use the class property here
      this.currentMarker = this.olaMapsCore.addMarker({ offset: [0, -10], anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .addTo(this.olaMapInstance);
    });
  }

  onSearch() {
    if (this.searchForm.invalid) {
      alert("Please enter a search term and drop a pin on the map!");
      return;
    }

    const searchData = this.searchForm.value;
    
    // 1. Construct the Ola Maps API URL
    // Note: The exact endpoint path might vary slightly based on Ola's latest API version, 
    // but a standard Text Search requires the input, location, and radius.
    const olaPlacesUrl = `${environment.olaPlacesUrl}?input=${encodeURIComponent(searchData.poiType)}&location=${searchData.latitude},${searchData.longitude}&radius=${searchData.radius}&api_key=${this.olaApiKey}`;
    this.http.get(olaPlacesUrl).subscribe({
      next: (response: any) => {
        console.log('Ola Maps API Results:', response);
        
        // 3. Clear out the old pins from the previous search
        this.poiMarkers.forEach(marker => marker.remove());
        this.poiMarkers = [];

        // 4. Check if we found anything (Ola usually returns an array named 'predictions' or 'results')
        const places = response.predictions || response.results || [];
        
        if (places.length > 0) {
          // 5. Loop through every place and drop a pin
          places.forEach((place: any) => {
            const placeLat = place.geometry.location.lat;
            const placeLng = place.geometry.location.lng;

            // Create a new marker. We give it a different color (e.g., red) 
            // so it doesn't look like the main blue pin the user dropped.
            const newMarker = this.olaMapsCore.addMarker({ color: 'red' }) 
              .setLngLat([placeLng, placeLat])
              .addTo(this.olaMapInstance);

            this.poiMarkers.push(newMarker);
          });
        } else {
          alert(`No ${searchData.poiType} found within that radius.`);
        }
      },
      error: (err) => console.error('Ola Maps API Error:', err)
    });

    // 6. Save the search history to your Node backend (unchanged)
    this.http.post(`${this.searchSaveUrl}/history/save`, searchData).subscribe({
      next: (res) => console.log('Saved custom search to DB', res),
      error: (err) => console.error('Failed to save', err)
    });
  }
}
