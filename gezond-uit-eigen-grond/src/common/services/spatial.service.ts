import { WfsSourceConfig } from '../domein/wizard-config';

export class SpatialService {
  private static readonly DEFAULT_WFS_URL = 'https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows';
  private static readonly DEFAULT_WFS_LAYER = 'ps:ps_hbtrl';
  private static readonly GEOLOCATION_API_URL = 'https://geo.api.vlaanderen.be/geolocation/v4/Location';

  /**
   * Checks if the given WKT geometry overlaps with a WFS layer.
   */
  async checkWfsOverlap(source: WfsSourceConfig, wkt: string): Promise<boolean> {
    const wfsUrl = source.url || SpatialService.DEFAULT_WFS_URL;
    const typeName = source.layer || SpatialService.DEFAULT_WFS_LAYER;
    const buffer = source.buffer || 0;

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeNames: typeName,
      outputFormat: 'application/json',
      count: '1'
    });

    const geomCol = 'geom'; 
    let cqlFilter = '';
    
    if (buffer > 0) {
      cqlFilter = `DWITHIN(${geomCol}, ${wkt}, ${buffer}, meters)`;
    } else {
      cqlFilter = `INTERSECTS(${geomCol}, ${wkt})`;
    }

    params.append('cql_filter', cqlFilter);

    try {
      // Adding a timestamp to prevent caching if needed, though usually POST is better for long WKT
      // For now keeping GET as per original implementation
      const response = await fetch(`${wfsUrl}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`WFS Request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.features && data.features.length > 0;
    } catch (error) {
      console.error('SpatialService: Error checking WFS overlap', error);
      // In case of error, default to false (safe failure) or rethrow? 
      // Original code returned false on error.
      return false;
    }
  }

  /**
   * Reverse geocodes the given coordinates (Lambert 72) to an address.
   */
  async reverseGeocode(x: number, y: number): Promise<string | null> {
    try {
      const response = await fetch(`${SpatialService.GEOLOCATION_API_URL}?xy=${x},${y}`);
      if (!response.ok) {
         throw new Error(`Geolocation API failed: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.LocationResult && data.LocationResult.length > 0) {
        return data.LocationResult[0].FormattedAddress;
      }
      return null;
    } catch (error) {
       console.error('SpatialService: Error fetching location address', error);
       return null;
    }
  }

  /**
   * Gets the postcode from coordinates (Lambert 72) using reverse geocoding.
   */
  async getPostcodeFromCoordinates(x: number, y: number): Promise<string | null> {
    try {
      const response = await fetch(`${SpatialService.GEOLOCATION_API_URL}?xy=${x},${y}`);
      if (!response.ok) {
        throw new Error(`Geolocation API failed: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.LocationResult && data.LocationResult.length > 0) {
        const location = data.LocationResult[0];
        // The API returns Zipcode field
        if (location.Zipcode) {
          return location.Zipcode;
        }
        // Fallback: try to extract postcode from FormattedAddress (format: "Straat 123, 9000 Gent")
        const formattedAddress = location.FormattedAddress;
        if (formattedAddress) {
          const postcodeMatch = formattedAddress.match(/\b(\d{4})\b/);
          if (postcodeMatch) {
            return postcodeMatch[1];
          }
        }
      }
      return null;
    } catch (error) {
      console.error('SpatialService: Error fetching postcode', error);
      return null;
    }
  }

  /**
   * Gets both address and postcode from coordinates in a single API call.
   */
  async getLocationInfo(x: number, y: number): Promise<{ address: string | null; postcode: string | null }> {
    try {
      const response = await fetch(`${SpatialService.GEOLOCATION_API_URL}?xy=${x},${y}`);
      if (!response.ok) {
        throw new Error(`Geolocation API failed: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.LocationResult && data.LocationResult.length > 0) {
        const location = data.LocationResult[0];
        let postcode = location.Zipcode || null;

        // Fallback: extract from formatted address
        if (!postcode && location.FormattedAddress) {
          const postcodeMatch = location.FormattedAddress.match(/\b(\d{4})\b/);
          if (postcodeMatch) {
            postcode = postcodeMatch[1];
          }
        }

        return {
          address: location.FormattedAddress || null,
          postcode
        };
      }
      return { address: null, postcode: null };
    } catch (error) {
      console.error('SpatialService: Error fetching location info', error);
      return { address: null, postcode: null };
    }
  }
}

export const spatialService = new SpatialService();
