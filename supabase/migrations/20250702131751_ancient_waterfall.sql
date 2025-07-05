/*
  # Données d'exemple pour Pirogue Connect

  1. Données de test
    - Profils utilisateurs de démonstration
    - Zones de sécurité et de pêche autour de Cayar
    - Canaux de communication
    - Données météorologiques
    - Positions GPS simulées

  2. Configuration
    - Zones géographiques prédéfinies
    - Canaux de communication par défaut
    - Données météo de base
*/

-- Insert default channels
INSERT INTO channels (id, name, description, channel_type, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Canal Général', 'Communication générale entre tous les pêcheurs', 'public', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Urgences', 'Canal dédié aux alertes et urgences', 'emergency', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Météo Marine', 'Informations météorologiques et conditions de mer', 'public', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Coordination GIE', 'Canal de coordination pour les organisations', 'organization', '550e8400-e29b-41d4-a716-446655440000');

-- Insert predefined zones around Cayar, Senegal
INSERT INTO zones (id, name, description, zone_type, coordinates, created_by) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'Zone de Sécurité Cayar',
    'Zone de sécurité principale autour du port de Cayar',
    'safety',
    '{"type":"Polygon","coordinates":[[[-17.2025,14.9225],[-17.1825,14.9225],[-17.1825,14.9425],[-17.2025,14.9425],[-17.2025,14.9225]]]}',
    '550e8400-e29b-41d4-a716-446655440000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'Zone de Pêche Traditionnelle',
    'Zone de pêche artisanale traditionnelle',
    'fishing',
    '{"type":"Polygon","coordinates":[[[-17.2125,14.9125],[-17.1925,14.9125],[-17.1925,14.9325],[-17.2125,14.9325],[-17.2125,14.9125]]]}',
    '550e8400-e29b-41d4-a716-446655440000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Zone Restreinte Navigation',
    'Zone restreinte pour la navigation commerciale',
    'restricted',
    '{"type":"Polygon","coordinates":[[[-17.1725,14.9525],[-17.1525,14.9525],[-17.1525,14.9725],[-17.1725,14.9725],[-17.1725,14.9525]]]}',
    '550e8400-e29b-41d4-a716-446655440000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'Couloir de Navigation',
    'Couloir principal pour l\'entrée et sortie du port',
    'navigation',
    '{"type":"Polygon","coordinates":[[[-17.1925,14.9325],[-17.1825,14.9325],[-17.1825,14.9525],[-17.1925,14.9525],[-17.1925,14.9325]]]}',
    '550e8400-e29b-41d4-a716-446655440000'
  );

-- Insert sample weather data for Cayar area
INSERT INTO weather_data (
  location,
  temperature,
  wind_speed,
  wind_direction,
  wave_height,
  visibility,
  pressure,
  humidity,
  condition,
  icon,
  forecast_time
) VALUES
  (
    ST_SetSRID(ST_MakePoint(-17.1925, 14.9325), 4326),
    26.5,
    12.0,
    230.0,
    1.2,
    8.0,
    1013.2,
    75.0,
    'Partly Cloudy',
    'partly-cloudy',
    NOW()
  ),
  (
    ST_SetSRID(ST_MakePoint(-17.1925, 14.9325), 4326),
    27.0,
    10.5,
    225.0,
    1.0,
    10.0,
    1014.1,
    72.0,
    'Sunny',
    'sunny',
    NOW() + INTERVAL '3 hours'
  ),
  (
    ST_SetSRID(ST_MakePoint(-17.1925, 14.9325), 4326),
    25.5,
    15.0,
    240.0,
    1.5,
    6.0,
    1012.8,
    78.0,
    'Cloudy',
    'cloudy',
    NOW() + INTERVAL '6 hours'
  );

-- Function to create sample locations for demo users
CREATE OR REPLACE FUNCTION create_sample_locations()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  base_lat DOUBLE PRECISION := 14.9325;
  base_lon DOUBLE PRECISION := -17.1925;
  i INTEGER;
BEGIN
  -- Create locations for fisherman users
  FOR user_record IN 
    SELECT id FROM profiles WHERE role = 'fisherman'
  LOOP
    -- Create 5 sample locations for each fisherman
    FOR i IN 1..5 LOOP
      INSERT INTO locations (
        user_id,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        created_at
      ) VALUES (
        user_record.id,
        base_lat + (RANDOM() - 0.5) * 0.02, -- Random offset within ~1km
        base_lon + (RANDOM() - 0.5) * 0.02,
        RANDOM() * 15, -- Speed 0-15 knots
        RANDOM() * 360, -- Heading 0-360 degrees
        5.0 + RANDOM() * 10, -- Accuracy 5-15 meters
        NOW() - (i * INTERVAL '10 minutes')
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create sample messages
CREATE OR REPLACE FUNCTION create_sample_messages()
RETURNS void AS $$
DECLARE
  general_channel_id UUID := '550e8400-e29b-41d4-a716-446655440001';
  weather_channel_id UUID := '550e8400-e29b-41d4-a716-446655440003';
  sample_messages TEXT[] := ARRAY[
    'Bonjour à tous, conditions de mer excellentes ce matin !',
    'Attention, banc de poissons repéré au nord de la zone de pêche',
    'Retour prévu vers 16h, bonne pêche aujourd''hui',
    'Météo favorable pour demain, vent faible',
    'Merci pour les informations partagées',
    'Zone de pêche très productive aujourd''hui',
    'Attention aux courants forts près de la côte',
    'Bonne journée à tous les pêcheurs !'
  ];
  user_ids UUID[] := ARRAY(SELECT id FROM profiles WHERE role = 'fisherman' LIMIT 3);
  msg TEXT;
  sender_id UUID;
  i INTEGER := 0;
BEGIN
  FOREACH msg IN ARRAY sample_messages
  LOOP
    i := i + 1;
    sender_id := user_ids[1 + (i % array_length(user_ids, 1))];
    
    INSERT INTO messages (
      sender_id,
      channel_id,
      content,
      message_type,
      created_at
    ) VALUES (
      sender_id,
      CASE WHEN i % 3 = 0 THEN weather_channel_id ELSE general_channel_id END,
      msg,
      'text',
      NOW() - (i * INTERVAL '30 minutes')
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create sample alerts
CREATE OR REPLACE FUNCTION create_sample_alerts()
RETURNS void AS $$
DECLARE
  user_ids UUID[] := ARRAY(SELECT id FROM profiles WHERE role = 'fisherman' LIMIT 2);
  org_id UUID := (SELECT id FROM profiles WHERE role = 'organization' LIMIT 1);
BEGIN
  -- Weather alert
  INSERT INTO alerts (
    user_id,
    type,
    title,
    message,
    severity,
    status,
    created_at
  ) VALUES (
    org_id,
    'weather',
    'Alerte Météo',
    'Conditions météorologiques défavorables prévues dans les prochaines heures. Vent fort et houle importante.',
    'medium',
    'active',
    NOW() - INTERVAL '2 hours'
  );

  -- System maintenance alert
  INSERT INTO alerts (
    user_id,
    type,
    title,
    message,
    severity,
    status,
    created_at
  ) VALUES (
    org_id,
    'system',
    'Maintenance Programmée',
    'Maintenance du système prévue demain de 02h00 à 04h00. Services temporairement indisponibles.',
    'low',
    'acknowledged',
    NOW() - INTERVAL '1 day'
  );

  -- Zone violation alert (resolved)
  IF array_length(user_ids, 1) > 0 THEN
    INSERT INTO alerts (
      user_id,
      type,
      title,
      message,
      severity,
      status,
      created_at
    ) VALUES (
      user_ids[1],
      'zone_violation',
      'Sortie de Zone',
      'Sortie détectée de la zone de sécurité autorisée. Veuillez vérifier votre position.',
      'high',
      'resolved',
      NOW() - INTERVAL '3 hours'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute sample data creation functions
-- Note: These will only work after user profiles are created through authentication
-- SELECT create_sample_locations();
-- SELECT create_sample_messages();
-- SELECT create_sample_alerts();