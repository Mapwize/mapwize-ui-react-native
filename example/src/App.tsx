/**
 * Mapwize UI view
 * https://mapwize.io
 *
 * @format
 * @flow strict-local
 */

import {
  ClickEvent,
  CreateMapwizeAPI,
  Direction,
  DirectionMode,
  DirectionOptions,
  DirectionPoint,
  DirectionProp,
  LatLngFloor,
  MapOptions,
  MapwizeApi,
  MapwizeConfiguration,
  MapwizeViewRef,
  MarkerProp,
  NavigationProp,
  Place,
  PlacePreview,
  PlaceStyleProp,
  Style,
  Universe,
  Venue,
} from 'mapwize-sdk-react-native'
import React, { useState } from 'react'
import { Alert } from 'react-native'

import MapwizeUI from 'mapwize-ui-react-native'
import {
  ButtonContent,
  FormattedPlaceDetails,
  RowsContent,
} from 'mapwize-ui-react-native'

const mapwizeConfiguration = new MapwizeConfiguration('MapwizeDevAPIKEY')
const venueId = '56b20714c3fa800b00d8f0b5'
const placeId = '5d08d8a4efe1d20012809ee5'
const Lojelis = '5e1cf7e01ddd8400138bbf7a'
const mapOptions = new MapOptions()
  .setCenterOnVenueId(venueId)
  // .setCenterOnPlaceId(placeId)
  .setRestrictContentToVenueIds([venueId])
  .setCompassEnabled(false)

const placeStyles = [
  new PlaceStyleProp(
    '5bc49413bf0ed600114db1f0',
    new Style(undefined, '#84440f', 1)
  ),
  new PlaceStyleProp(
    '5eb40d997b62ff00167fca1c',
    new Style(undefined, '#8444ff', 1)
  ),
]

let mapwizeRef: MapwizeViewRef
const mapwizeApi: MapwizeApi = CreateMapwizeAPI(mapwizeConfiguration)

const setNavigationExample = (
  mapwizeApi: MapwizeApi,
  setNavigationProp: (navigationProp: NavigationProp | undefined) => void,
  setUserLocation: (userLocation: LatLngFloor | undefined) => void
) => {
  mapwizeApi.getPlace('5eb40d9955039600161ce6d3').then((place1) => {
    mapwizeApi.getPlace('5d08d8a4efe1d20012809ee5').then((place2) => {
      setUserLocation(place2.markerCoordinate)
      const mode = new DirectionMode('5da6bec9aefa100010c7df67', '', 0.0, '')
      setNavigationProp(
        new NavigationProp(
          place1,
          mode,
          new DirectionOptions().setCenterOnStart(true),
          15
        )
      )
    })
  })
}

const setDirectionExample = (
  mapwizeApi: MapwizeApi,
  setDirectionProp: (directionProp: DirectionProp | undefined) => void
) => {
  mapwizeApi.getPlace('5eb40d9955039600161ce6d3').then((place1) => {
    mapwizeApi.getPlace('5d08d8a4efe1d20012809ee5').then((place2) => {
      const mode = new DirectionMode('5da6bec9aefa100010c7df67', '', 0.0, '')
      mapwizeApi.getDirection(place1, place2, mode).then(
        (direction: Direction) => {
          setDirectionProp(
            new DirectionProp(
              direction,
              new DirectionOptions().setCenterOnStart(true)
            )
          )
        },
        (error) => {
          Alert.alert('getDirection Failed', error)
        }
      )
    })
  })
}

const App = () => {
  const [userLocation, setUserLocation] = useState<LatLngFloor | undefined>(
    undefined
  )
  const [selectedPlace, setSelectedPlace] = useState<
    Place | PlacePreview | undefined
  >(undefined)
  const [promotedPlaces, setPromotedPlaces] = useState<
    (Place | PlacePreview)[] | undefined
  >(undefined)
  const [markers, setMarkers] = useState<MarkerProp[] | undefined>(undefined)
  const [directionProp, setDirectionProp] = useState<DirectionProp | undefined>(
    undefined
  )
  const [navigationProp, setNavigationProp] = useState<
    NavigationProp | undefined
  >(undefined)
  return (
    <MapwizeUI
      mapwizeConfiguration={mapwizeConfiguration}
      mapOptions={mapOptions}
      onUiReady={(ref) => {
        mapwizeRef = ref
        // setNavigationExample(mapwizeApi, setNavigationProp, setUserLocation);
        // setDirectionExample(mapwizeApi, setDirectionProp);

        // ref.setFloor(2); //Won't work when using centerOnPlace
        // mapwizeApi.getPlace(placeId).then((place) => {
        //   setSelectedPlace(place);
        //   ref.centerOn(place);
        // });
        // mapwizeApi.getPlace(Lojelis).then((place) => {
        //   setPromotedPlaces([place]);
        //   setMarkers([new MarkerProp(place.markerCoordinate)]);
        // });
      }}
      onNavigationRequested={(
        venue: Venue,
        universe: Universe,
        navigationProp: NavigationProp
      ) => {
        console.log('onNavigationRequested')
        //   venue.name,
        //   universe.name,
        //   navigationProp,
        // );
        return undefined
      }}
      onDirectionWillStart={(
        venue: Venue,
        universe: Universe,
        from: DirectionPoint,
        to: DirectionPoint,
        mode: DirectionMode
      ) => {
        console.log('onDirectionStart')
        //   venue.name,
        //   universe.name,
        //   from,
        //   to,
        //   mode,
        //   isNavigation,
        // );
        return Promise.resolve(undefined)
      }}
      mainColor="#29b"
      floorControllerHidden={false}
      followUserButtonHidden={false}
      menuButtonHidden={false}
      mapNavigation={navigationProp}
      mapDirection={directionProp}
      markers={markers}
      promotedPlaces={promotedPlaces}
      selectedPlace={selectedPlace}
      placeStyles={placeStyles}
      userLocation={userLocation}
      onMapClick={(clickEvent: ClickEvent) => {
        setUserLocation(clickEvent.latLngFloor)
      }}
      onPlaceSelected={(
        placeDetails: FormattedPlaceDetails,
        rowsContents: RowsContent[],
        buttonsContents: ButtonContent[]
      ) => {
        if (placeDetails.titleLabel?.startsWith('Atrium')) {
          // rowsContents.unshift({
          //   id: 'ads',
          //   title: 'Buy one, get one for free',
          //   imageSrc: icons.RUN,
          //   available: true,
          //   callback: () => Alert.alert('Your lucky day'),
          // });
          buttonsContents.forEach((button) => {
            if (button.id === 'mwz-directions-button') {
              button.title = 'Go to'
            }
          })
        }
      }}
    />
  )
}

export default App
