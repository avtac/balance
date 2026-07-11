# Spec

## Config

Description: Root to the configuration file

id (String): Unique id
name (String): Name entire configuration file
aircraft ([Aircraft](#spec-aircraft)\[\]): List of all aircraft in configuration
setup ([Setup](#spec-setup)): Contains configuration wide settings

### Example

{
  "id": "3a96fb20-3e4f-4394-9b33-3542c7425f58",
  "name": "Cessna Config",
  "aircraft": \[...\],
  "setup": {
    "weightUnits": "lbs",
    "lengthUnits": "in",
    "fuelUnits": "gal",
    "useMAC": true,
    "fuelDensity": 6
  }
}

## Setup {#spec-setup}

Description: This contains the default units used in this configuration.

weightUnits (String): 'lbs' | 'kg' | 'oz' | 'g'
lengthUnits (String): 'in' | 'ft' | 'm' | 'mm'
fuelUnits (String): 'lbs' | 'kg' | 'oz' | 'g' | 'gal' | 'liters' | 'ml'
fuelDensity (Number): Defines the conversion between volume units and weight units for fuel
saved in pounds per gallon
useMAC (Boolean): Defines whether MAC is displayed if true or if length units are used

"setup": {
  "weightUnits": "lbs",
  "lengthUnits": "in",
  "fuelUnits": "gal",
  "useMAC": true,
  "fuelDensity": 6
}

## Aircraft {#spec-aircraft}

Description: List of all the aircraft objects

id (String): Unique id
properties ([Properties](#spec-properties)): Contains aircraft specific properties
limits ([Aircraft Limits](#spec-aircraft-limits)): Includes both absolute weight limits, and envelope limitations
seats ([Seats](#spec-seats)\[\]): List of all available seat positions
cargoAreas ([Cargo Area](#spec-cargo-areas)\[\]): List of all available cargo positions
fuelTanks ([Fuel Tank](#spec-fuel-tank)\[\]): List of all available fuel tanks
equipment ([Equipment](#spec-equipment])\[\]): List of all possible equipment
aircraftConfigs ([Aircraft Config](#spec-aircraft-config)\[\]): List of all aircraft configs
operationConfigs ([Operation Config](#spec-operation-config)\[\]): List of all operation configs

## Properties {#spec-properties}

Description: Basic properties of the aircraft

tailNumber (String): Aircraft Tail Number
type (String): Aircraft Type Code
emptyWeight (Number): Basic empty weight of aircraft
emptyArm (Number): distance of CG from datum of the empty aircraft
leadingEdgeMAC (Number): Position of leading edge MAC
mac (Number): Length of mean aerodynamic chord

### Example

"properties": {
  "tailNumber": "12345",
  "type": "C172",
  "emptyArm": 35.5,
  "emptyWeight": 1550,
  "mac": 58.8,
  "leadingEdgeMAC": 25.9
}

## Limits {#spec-aircraft-limits}

Description: Contains lists of both weight limits and operating envelopes

regions ([Region](#spec-region)\[\]): List of all balance envelopes
limits ([Limit](#spec-limit)\[\]): List of all weight limits

## Region {#spec-region}

Description: A list of points defining a region that the aircraft weight and arm can be within. Does not need last point to close polygon.

id (String): Unique id
name (String): Name of region
color (?String): Hex string including # (i.e. '#FFFFFF') to define fill and border of area
lineStyle (?String): An SVG stroke-dasharray to define the stroke design
data ([Region Point](#spec-region-point)\[\]): List of weight/arm pairs defining the area

### Example

"regions": \[
  {
    "name": "Normal",
    "id": "ed5a0b5b-64d1-402a-aa4e-4e7e5a4e9ff8",
    "color": "#fe9090",
    "data": \[
      {
        "id": "4d3ce18b-5862-4a9a-b5b4-faffad67dcba",
        "weight": 1500,
        "arm": 35
      },
      {
        "arm": 35,
        "weight": 1950,
        "id": "d65056a6-6ae7-4317-aafe-b9f529d97bb4"
      },
      {
        "id": "0d72e2b0-9943-4e54-98ae-f80ebecdb32c",
        "weight": 2550,
        "arm": 41
      },
      {
        "id": "c0afe591-8817-47f1-a2de-92f34589d7f0",
        "weight": 2550,
        "arm": 47.3
      },
      {
        "id": "0373d76a-775e-47e9-8212-5358716a8567",
        "weight": 1500,
        "arm": 47.3
      }
    \]
  }
\]

## Region Point {#spec-region-point}

Description: Single weight arm pair used to define a [Region](#spec-region)

id (String): Unique id
weight (Number): Weight of point
arm (Number): Arm of point

### Example

{
  "id": "0373d76a-775e-47e9-8212-5358716a8567",
  "weight": 1500,
  "arm": 47.3
}

## Limit {#spec-limit}

Description: A defined weight limit for all arms

id (String): Unique id
name (String): Name of limit
weight (Number): The weight of the limit
color (?String): Hex string including # (i.e. '#FFFFFF') to define fill and border of area
lineStyle (?String): An SVG stroke-dasharray to define the stroke design

### Example

"limits": \[
  {
    "name": "MTOW",
    "id": "32469061-612e-4bce-9ab5-d8c4bc11eafe",
    "weight": 2550,
    "color": "#4481E4"
  }
\]

## Seat Locations {#spec-seats}

Description: Defined position where passengers can be loaded.

id (String): Unique id
name (String): Name of seat
seatCount (Number): Number of seats in group
arm (Number): Arm of seat location
maxWeight (Number): Max weight that can be in the seat
lateralDist (Number): Lateral displacement of the center of the seat group from the center of the aircraft

### Example

"seats": \[
  {
    "id": "57708145-9605-46af-b0d4-7e58573c2f15",
    "name": "Pilot Seat",
    "arm": 37,
    "seatCount": 2,
    "lateralDist": 0,
    "maxWeight": 200
  },
  {
    "id": "fe68e486-56a7-43d8-97bf-7e11936f1227",
    "name": "Rear Passengers",
    "arm": 73,
    "seatCount": 2,
    "maxWeight": 200,
    "lateralDist": 0
  }
\]

## Cargo Locations {#spec-cargo-areas}

Description: Location where cargo can be loaded

id (String): Unique id
name (String): Name of cargo area
arm (Number): Arm of cargo location
maxWeight (Number): Max weight that can be in the 

### Example

"cargoareas": \[
  {
    "id": "a55ec43e-1e7f-4f3d-9d8f-b3d1ca1114f1",
    "name": "baggage area 1",
    "arm": 95,
    "maxweight": 120
  },
  {
    "id": "e815e3a5-7ec3-46d8-b91d-34ec1cfb2f4a",
    "name": "baggage area 2",
    "arm": 123,
    "maxweight": 50
  },
  {
    "id": "09a01e2c-72a4-430e-892c-c1cdf344039b",
    "name": "baggage rear seats",
    "arm": 73,
    "maxweight": 400
  }
\]

## Fuel Tanks {#spec-fuel-tank}

Description: Defines each location that can hold fuel and how much, removable tanks can be disabled in the config otherwise the are in all configs

id (String): Unique id
name (String): Name of fuel tank
arm (Number): Arm of fuel tank location in inches
maxWeight (Number): Max fuel weight in tank in pounds
unusable (Number): Weight of unusable fuel in pounds
priority (Number): Number defining priority of the tank (1 Fill first/Empty last, 100 Fill last/Empty First) (Can have same priority for multiple tanks)
removable (boolean): Defines whether the tank can be disabled in the config

### Example

"fuelTanks": \[
  {
    "id": "23469182-12f8-4963-b9d4-5d5821495a97",
    "name": "Main",
    "arm": 48,
    "maxWeight": 300,
    "unusable": 6,
    "removable": false,
    "priority": 0
  }
\]

## Equipment {#spec-equipment}

id (String): Unique id
name (String): Name of equipment
area (String): id of seat or cargo area that the equipment is located
arm (Number): Arm of equipment location
weight (Number): Weight of the equipment

### Example

"equipment": \[
  {
    "id": "23469182-12f8-4963-b9d4-5d5821495a97",
    "name": "Fire Extinguisher",
    "arm": 44,
    "weight": 4.8,
    "area": ""
  },
  {
    "id": "a55ec43e-1e7f-4f3d-9d8f-b3d1ca1114f1",
    "name": "Fire Extinguisher Mounting Clamp",
    "arm": 42.2,
    "weight": 0.5,
    "area": ""
  }
\]

## Aircraft Configurations {#spec-aircraft-config}

Description: Defines a list of configurations describing how the aircraft is set up, what seats are available, what fuel tanks are loaded, and where cargo can be placed. It also defines the equipment on the plane

id (String): Unique id
name (String): Name of configuration
seats (String[]): List of seat IDs used in the config
cargoAreas (String[]): List of cargo IDs used in the config
fuelTanks (String[]): List of removable fuel tank IDs used in the config (Fixed fuel tanks are added automatically without defining here)
equipment ({"id": String, "count": Number}[]): List of Equipment objects defining the id and count of each equipment in the config

### Example

"aircraftConfigs": \[
  {
    "id": "dfb67813-3bcd-4475-a074-568f2c0e7deb",
    "name": "Standard",
    "seats": [
      "57708145-9605-46af-b0d4-7e58573c2f15",
      "fe68e486-56a7-43d8-97bf-7e11936f1227"
    ],
    "cargoAreas": [
      "a55ec43e-1e7f-4f3d-9d8f-b3d1ca1114f1",
      "e815e3a5-7ec3-46d8-b91d-34ec1cfb2f4a"
    ],
    "equipment": \[\],
    "fuelTanks": \[\]
  },
  {
    "id": "7dd20d29-2873-40b5-a721-104c0c8d9ca7",
    "name": "Cargo",
    "seats": [
      "57708145-9605-46af-b0d4-7e58573c2f15"
    ],
    "cargoAreas": [
      "a55ec43e-1e7f-4f3d-9d8f-b3d1ca1114f1",
      "e815e3a5-7ec3-46d8-b91d-34ec1cfb2f4a",
      "09a01e2c-72a4-430e-892c-c1cdf344039b"
    ],
    "equipment": \[\],
    "fuelTanks": \[\]
  }
\]

## Operation Configuration (BOW) {#spec-operation-config}

Description: Defines a list of preloaded crew and crew cargo do define the operations configuration

id (String): Unique id
name (String): Name of configuration
config (String): Id of the aircraft configuration used by this operations configuration
seats ({"id": String, "weight": Number}[]): List of seat IDs with crew weight (Must be in the corresponding aircraft configuration)
cargoAreas ({"id": String, "weight": Number}[]): List of cargoAreas IDs with crew weight

### Example

"operationConfigs": \[
  {
    "id": "eaaec1ba-66a7-4f90-a4bb-0fa9aa5e1275",
    "name": "1 Pilot Standard",
    "config": "dfb67813-3bcd-4475-a074-568f2c0e7deb",
    "seats": \[
      {
        "id": "57708145-9605-46af-b0d4-7e58573c2f15",
        "weight": 200
      }
    \],
    "cargoAreas": \[
      {
        "id": "a55ec43e-1e7f-4f3d-9d8f-b3d1ca1114f1",
        "weight": 20
      }
    \]
  },
  {
    "id": "d8050373-e61a-441b-b3a6-289cf5088990",
    "name": "Cargo",
    "config": "7dd20d29-2873-40b5-a721-104c0c8d9ca7",
    "seats": \[
      {
        "id": "57708145-9605-46af-b0d4-7e58573c2f15",
        "weight": 200
      }
    \],
    "cargoAreas": \[
      {
        "id": "e815e3a5-7ec3-46d8-b91d-34ec1cfb2f4a",
        "weight": 20
      }
    \]
  }
\]

