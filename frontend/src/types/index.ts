export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  created_by: string;
  created_at: string;
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  site_code: string;
  area_hectares: number;
  polygon_geojson: GeoJSON.Polygon;
  centroid_lat: number;
  centroid_lng: number;
  status: string;
  created_at: string;
}

export interface SiteAnalytics {
  id: string;
  site_id: string;
  observed_on: string;
  carbon_score: number;
  biodiversity_score: number;
  vegetation_index: number;
  soil_health_index: number;
  notes: string | null;
  created_at: string;
}