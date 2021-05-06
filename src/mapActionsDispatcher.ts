import produce from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import {
  DirectionProp,
  LatLngFloor,
  MapwizeViewRef,
  MarkerProp,
  NavigationProp,
  Place,
  Placelist,
  PlacePreview,
  Universe,
  Venue,
} from 'mapwize-sdk-react-native'
import { ApiService } from './apiService'
import { DevCallbackInterceptor } from './devCallbackInterceptor'
import { MapwizeMapState } from './uiController'

export default class MapActionsDispatcher {
  private mapwizeMap: MapwizeViewRef
  private render: (oldState: MapwizeMapState, newState: MapwizeMapState) => void
  private state: MapwizeMapState
  private devCallbackInterceptor: DevCallbackInterceptor
  private apiService: ApiService

  constructor(
    mapwizeMap: MapwizeViewRef,
    mapwizeMapState: MapwizeMapState,
    render: (oldState: MapwizeMapState, newState: MapwizeMapState) => void,
    apiService: ApiService,
    devCallbackInterceptor: DevCallbackInterceptor
  ) {
    this.mapwizeMap = mapwizeMap
    this.state = mapwizeMapState
    this.render = render
    this.apiService = apiService
    this.devCallbackInterceptor = devCallbackInterceptor
  }

  syncState(mapwizeMapState: MapwizeMapState) {
    this.state = {
      ...this.state,
      selectedPlace: mapwizeMapState.selectedPlace,
      markers: mapwizeMapState.markers,
    }
    // this.state = mapwizeMapState;//TODO check if there are drawbacks
  }
  public fireError(message: string): void {
    console.error(new Error(message))
  }

  public selectPlace(
    place: Place | PlacePreview,
    preventCenter: boolean = false
  ) {
    if (!preventCenter) {
      const plceAny: any = place
      plceAny.defaultCenter && this.mapwizeMap.centerOn(plceAny.defaultCenter)
      plceAny.markerCoordinate &&
        this.mapwizeMap.centerOn(plceAny.markerCoordinate)
    }
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.selectedPlace = place
        draftState.markers = []
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public selectPlacelist(placelist: Placelist) {
    this.apiService.getPlacesForPlacelist(placelist).then((places: Place[]) => {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeMapState>) => {
          draftState.selectedPlace = undefined //TODO check that `undefined` does unselect place
          draftState.markers = places.map(
            (place: Place) => new MarkerProp(place.markerCoordinate)
          )
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
    })
  }

  public unselectContent() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.selectedPlace = undefined
        draftState.markers = []
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async centerOnPlace(place: any): Promise<void> {
    return this.mapwizeMap.getZoom().then((zoom: number) => {
      // if (zoom < 19) {
      //   zoom = 19;
      // }
      const opts = {
        centerOnElement: true,
        zoom,
      }
      if (opts?.centerOnElement) {
        return this.mapwizeMap.centerOn(place)
      }
      return Promise.resolve()
    })
  }

  public async centerOnPlacelist(placelist: any): Promise<void> {
    return this.mapwizeMap.getZoom().then((zoom: number) => {
      if (zoom > 19) {
        zoom = 19
      }
      const opts = { centerOnElement: true, zoom }
      if (opts?.centerOnElement) {
        return this.mapwizeMap.centerOn(placelist.venue, opts.zoom)
      }
      return Promise.resolve()
    })
  }

  public centerOnVenue(venue: Venue) {
    this.mapwizeMap.centerOn(venue)
  }

  public startDirection(
    direction: any,
    options: any,
    startLabel: string,
    endLabel: string
  ) {
    options.startMarkerOptions = {
      textField: startLabel,
    }
    options.endMarkerOptions = {
      textField: endLabel,
    }
    const directionProp = new DirectionProp(direction, options)
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.mapDirection = directionProp
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public stopDirection() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.mapDirection = undefined //TODO check that `undefined` remove direction
        draftState.mapNavigation = undefined //TODO check that `undefined` remove direction
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }
  startNavigation(navigationProp: NavigationProp) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.mapNavigation = navigationProp
        draftState.mapDirection = undefined
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public setLeftMargin() {
    //TODO setLeftMargin
    // this.mapwizeMap.setLeftMargin(400);
  }

  public setLanguage(language: string) {
    this.mapwizeMap.setPreferredLanguage(language)
  }

  public setUniverse(universe: Universe) {
    this.mapwizeMap.setUniverse(universe)
  }

  public hasIndoorLocation(): boolean {
    const userLocation = this.state.userLocation
    return userLocation?.floor !== undefined
  }

  public getUserLocation(): LatLngFloor | undefined {
    return this.state.userLocation
  }
  setUserLocation(latLngFloor: LatLngFloor | undefined) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeMapState>) => {
        draftState.userLocation = latLngFloor
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }
}
