// @ts-nocheck
import React from 'react'
import MapwizeMap, {
  CreateMapwizeAPI,
  MapwizeViewRef,
  MapwizeConfiguration,
  Venue,
  Universe,
  DirectionMode,
  ClickEvent,
  FollowUserMode,
  Place,
  LatLngFloor,
  VenuePreview,
  PlacePreview,
  MarkerProp,
  Placelist,
  DirectionProp,
  NavigationProp,
  DirectionPointWrapper,
  Direction,
  NavigationInfo,
} from 'mapwize-sdk-react-native'
import { Linking, Share } from 'react-native'
import BottomView, { BottomViewState } from './components/bottomview'
import FloorController, {
  FloorControllerState,
} from './components/floorcontroller'
import FollowUserButton, {
  FollowUserButtonState,
} from './components/followUserButton'
import LanguageSelector, {
  LanguageSelectorState,
} from './components/languageSelector'
import SearchBar, { SearchBarState } from './components/search/searchBar'
import SearchContainer, {
  SearchContainerState,
} from './components/search/searchContainer'
import SearchDirectionBar, {
  SearchDirectionBarState,
} from './components/search/searchDirectionBar'
import SearchResultList, {
  SearchResultListState,
} from './components/search/searchResultList'
import UniverseSelector, {
  UniverseSelectorState,
} from './components/universeSelector'

import { UIControllerStore } from './uiControllerStore'
import MapActionsDispatcher from './mapActionsDispatcher'
import {
  buildCallbackInterceptor,
  DevCallbackInterceptor,
} from './devCallbackInterceptor'
import { StyleSheet, View } from 'react-native'
import { ApiService } from './apiService'
import { Floor, SearchResult, UIOptions } from './types'
import { buildPlaceDetails } from './formatter'
import {
  lang_back,
  lang_change_language,
  lang_change_universe,
  lang_choose_destination,
  lang_choose_starting_point,
  lang_direction,
  lang_floor_controller,
  lang_menu,
  lang_search_global,
  lang_search_no_results,
} from './localizor'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import RGBColor from 'rgbcolor'
import * as RNLocalize from 'react-native-localize'
import NavigationControl from './components/navigationControls'
const defaultOptions: UIOptions = {
  mapwizeConfiguration: new MapwizeConfiguration('Default API key'),
  floorControllerHidden: false,
  followUserButtonHidden: false,
  preferredLanguage: RNLocalize.getLocales()[0].languageCode || 'en',
  unit: RNLocalize.usesMetricSystem() ? 'm' : 'ft',
  uses24: RNLocalize.uses24HourClock(),
  mainColor: '#C51586',
}

export default class UIController extends React.Component<
  UIOptions,
  MapwizeUIState
> {
  private store?: UIControllerStore
  private mapwizeMap?: MapwizeViewRef

  private uiOptions: UIOptions
  private callbackInterceptor: DevCallbackInterceptor
  private apiService: ApiService
  private mapActionDispatcher: MapActionsDispatcher | undefined
  private navigationControl?: NavigationControl

  constructor(props: UIOptions) {
    super(props)
    this.uiOptions = { ...defaultOptions, ...props }
    this.uiOptions.mainColor = new RGBColor(this.uiOptions.mainColor).toHex()
    if (props.mapOptions.mainColor === undefined) {
      props.mapOptions.mainColor = this.uiOptions.mainColor
    }
    this.callbackInterceptor = buildCallbackInterceptor(
      props as DevCallbackInterceptor
    )
    const mapwizeApi = CreateMapwizeAPI(props.mapwizeConfiguration)
    this.apiService = new ApiService(
      { ...props.mapOptions, ...props },
      mapwizeApi
    )
    this.state = buildDefaultState(this.uiOptions)
  }
  componentDidMount() {
    configureStateFromApi(
      { ...this.state },
      this.uiOptions,
      this.apiService
    ).then((newState) => {
      this.setState(newState)
    })
  }
  shouldComponentUpdate(nextProps: UIOptions) {
    if (nextProps.userLocation !== this.state.mapwizeMapState.userLocation) {
      this.mapActionDispatcher?.setUserLocation(nextProps.userLocation)
      return false
    }
    if (
      nextProps.selectedPlace !== this.props.selectedPlace &&
      nextProps.selectedPlace?._id !==
        this.state.mapwizeMapState.selectedPlace?._id
    ) {
      this.store?.selectPlace(nextProps.selectedPlace)
      this.mapActionDispatcher?.centerOnPlace(nextProps.selectedPlace)
      return false
    }

    if (
      nextProps.mapDirection !== this.props.mapDirection &&
      nextProps.mapDirection !== this.state.mapwizeMapState.mapDirection
    ) {
      this.store?.startDirectionFromProps(nextProps.mapDirection)
      return false
    }

    if (
      nextProps.mapNavigation !== this.props.mapNavigation &&
      nextProps.mapNavigation !== this.state.mapwizeMapState.mapNavigation
    ) {
      this.store?.startNavigationFromProps(nextProps.mapNavigation)
      return false
    }
    return true
  }
  renderState(oldState: MapwizeUIState, newState: MapwizeUIState) {
    this.mapActionDispatcher.syncState(newState.mapwizeMapState)
    this.setState({
      ...newState,
      mapwizeMapState: {
        ...this.state.mapwizeMapState,
        selectedPlace: newState.mapwizeMapState.selectedPlace,
        markers: newState.mapwizeMapState.markers,
      },
    })
  }
  renderMapwizeMapState(oldState: MapwizeMapState, newState: MapwizeMapState) {
    this.setState({ mapwizeMapState: newState })
  }
  render() {
    return (
      <SafeAreaProvider>
        <MapwizeMap
          {...this.props}
          style={styles.map}
          onMapLoaded={(mapwizeMap: MapwizeViewRef) => {
            this.props.onMapLoaded?.(mapwizeMap)
            this.mapwizeMap = mapwizeMap
            this.mapActionDispatcher = new MapActionsDispatcher(
              mapwizeMap,
              this.state.mapwizeMapState,
              this.renderMapwizeMapState.bind(this),
              this.apiService,
              this.callbackInterceptor
            )
            this.store = new UIControllerStore(
              this.state,
              this.renderState.bind(this),
              this.mapActionDispatcher,
              this.apiService,
              this.callbackInterceptor
            )
            this.props.onUiReady?.(mapwizeMap)
          }}
          userLocation={this.state.mapwizeMapState.userLocation}
          markers={this.props.markers || this.state.mapwizeMapState.markers}
          selectedPlace={this.state.mapwizeMapState.selectedPlace}
          mapDirection={this.state.mapwizeMapState.mapDirection}
          mapNavigation={this.state.mapwizeMapState.mapNavigation}
          onNavigationUpdate={(navigationInfo: NavigationInfo) => {
            this.props.onNavigationUpdate?.(navigationInfo)
            this.store?.updateNavigationInfo(navigationInfo)
          }}
          onVenueWillEnter={(venue: Venue) => {
            this.props.onVenueWillEnter?.(venue)
            this.store?.willEnterInVenue(venue)
          }}
          onVenueEnter={(venue: Venue) => {
            this.props.onVenueEnter?.(venue)
            this.store?.changeLanguages(['en', 'fr']) //TODO get the venue languages instead
            this.store?.enterInVenue(venue)
          }}
          onVenueExit={(venue: Venue) => {
            this.props.onVenueExit?.(venue)
            this.store?.exitVenue(venue)
          }}
          onFloorsChange={(floors: Floor[]) => {
            this.props.onFloorsChange?.(floors)
            this.store?.changeFloors(floors)
          }}
          onFloorWillChange={(floor: Floor) => {
            this.props.onFloorWillChange?.(floor)
            this.store?.loadFloor(floor.number)
          }}
          onFloorChange={(floor: Floor) => {
            this.props.onFloorChange?.(floor)
            this.store?.changeFloor(floor ? floor.number : null)
          }}
          onUniversesChange={(universes: Universe[]) => {
            this.props.onUniversesChange?.(universes)
            this.store?.changeUniverses(universes)
          }}
          onUniverseChange={(universe: Universe) => {
            this.props.onUniverseChange?.(universe)
            this.store?.changeUniverse(universe)
          }}
          onLanguageChange={(language: string) => {
            this.props.onLanguageChange?.(language)
            this.store?.changeLanguage(language)
          }}
          onDirectionModesChange={(directionModes: DirectionMode[]) => {
            this.props.onDirectionModesChange?.(directionModes)
            this.store?.changeDirectionModes(directionModes)
          }}
          onFollowUserModeChange={(followUserMode: FollowUserMode) => {
            this.props.onFollowUserModeChange?.(followUserMode)
            this.setState({
              followUserButtonState: {
                ...this.state.followUserButtonState,
                followUserMode,
              },
            })
          }}
          onMapClick={(clickEvent: ClickEvent) => {
            this.props.onMapClick?.(clickEvent)
            switch (clickEvent.eventType) {
              case 'map_click':
                this.store?.onMapClick({
                  latitude: clickEvent.latLngFloor.latitude,
                  longitude: clickEvent.latLngFloor.longitude,
                  floor: clickEvent.latLngFloor.floor,
                })
                break
              case 'venue_click':
                this.store?.onVenueClick(clickEvent.venuePreview)
                break
              case 'place_click':
                this.store?.onPlaceClick(clickEvent.placePreview)
                break
            }
          }}
          onCameraChange={(camera) => {
            this.props.onCameraChange?.(camera)
            this.navigationControl?.setHeading(camera.bearing)
          }}
        />
        <SearchContainer
          style={styles.searchContainer}
          reduxState={this.state.searchContainerState}
        >
          <SearchBar
            style={styles.searchBar}
            reduxState={this.state.searchBarState}
            menuButtonHidden={this.props.menuButtonHidden}
            onDirectionClick={() => this.store?.directionButtonClick()}
            onMenuClick={() => this.callbackInterceptor?.onMenuButtonClick?.()}
            onSearchTextFocus={() => this.store?.searchFocus()}
            onSearchTextBlur={() => this.store?.searchBlur()}
            onSearchTextChange={(text: string) =>
              this.store?.searchQueryChange(text)
            }
            onBackClick={() => this.store?.searchBackButtonClick()}
          />
          <SearchDirectionBar
            style={styles.searchDirectionBar}
            reduxState={this.state.searchDirectionBarState}
            onSelectedModeChange={(directionMode: DirectionMode) =>
              this.store?.changeDirectionMode(directionMode)
            }
            onBackButtonClick={() => this.store?.directionBackButtonClick()}
            onSwapButtonClick={() => this.store?.swapFromAndTo()}
            onFromQueryChange={(query: string) =>
              this.store?.directionSearchFromQueryChange(query)
            }
            onToQueryChange={(query: string) =>
              this.store?.directionSearchToQueryChange(query)
            }
            onFromBlur={() => this.store?.directionFromBlur()}
            onToBlur={() => this.store?.directionToBlur()}
            onFromFocus={() => this.store?.directionFromFocus()}
            onToFocus={() => this.store?.directionToFocus()}
          />
          <SearchResultList
            style={styles.searchResultList}
            reduxState={this.state.searchResultListState}
            callbackInterceptor={this.callbackInterceptor}
            onCurrentLocationSelected={() =>
              this.store?.selectCurrentLocation()
            }
            onResultSelected={(
              searchResult: SearchResult,
              universe?: Universe | undefined
            ) => this.store?.selectSearchResult(searchResult, universe)}
          />
        </SearchContainer>
        <SafeAreaView
          style={[styles.middleContainer]}
          pointerEvents="box-none"
          mode="margin"
          edges={(!this.state.bottomViewState.hidden && ['left']) || ['bottom']}
        >
          <View style={styles.middleLeftContainer}>
            <UniverseSelector
              style={styles.universeSelector}
              reduxState={this.state.universeSelectorState}
              onClick={() => this.store?.toggleUniverseSelector()}
              onUniverseSelected={(universe: Universe) =>
                this.mapwizeMap?.setUniverse(universe)
              }
            />
            <LanguageSelector
              style={styles.languageSelector}
              reduxState={this.state.languageSelectorState}
              onClick={() => this.store?.toggleLanguageSelector()}
              onLanguageSelected={(language: string) =>
                this.state.uiControllerState.venue &&
                this.mapwizeMap?.setLanguageForVenue(
                  language,
                  this.state.uiControllerState.venue
                )
              }
            />
          </View>
          <View style={styles.middleRightContainer}>
            <NavigationControl
              onReady={(ref) => (this.navigationControl = ref)}
              style={styles.middleRightTopContainer}
              onCompassClick={() => this.mapwizeMap?.resetNorth()}
            />
            <View style={styles.middleRightBottomContainer}>
              <FloorController
                style={styles.floorController}
                reduxState={this.state.floorControllerState}
                disabled={this.props.floorControllerHidden}
                onFloorSelected={(floor: number) =>
                  this.mapwizeMap?.setFloor(floor)
                }
              />
              <FollowUserButton
                style={styles.followUserButton}
                reduxState={this.state.followUserButtonState}
                hasLocation={
                  this.state.mapwizeMapState.userLocation !== undefined
                }
                disabled={this.props.followUserButtonHidden}
                onClick={() => {
                  if (!this.state.mapwizeMapState.userLocation) {
                    this.callbackInterceptor?.onFollowUserButtonClickWithoutLocation?.()
                  }
                  this.mapwizeMap
                    ?.getFollowUserMode()
                    .then((mode: FollowUserMode) => {
                      if (mode.followUserMode === 'none') {
                        this.mapwizeMap?.setFollowUserMode(
                          new FollowUserMode('follow_user')
                        )
                      } else if (mode.followUserMode === 'follow_user') {
                        this.mapwizeMap?.setFollowUserMode(
                          new FollowUserMode('follow_user_and_heading')
                        )
                      } else if (
                        mode.followUserMode === 'follow_user_and_heading'
                      ) {
                        this.mapwizeMap?.setFollowUserMode(
                          new FollowUserMode('none')
                        )
                      }
                    })
                }}
              />
            </View>
          </View>
        </SafeAreaView>
        <BottomView
          style={styles.bottomView}
          reduxState={this.state.bottomViewState}
          callbackInterceptor={this.callbackInterceptor}
          onExpandClick={() => this.store?.toggleBottomViewExpand()}
          onDirectionClick={() => this.store?.directionButtonClick()}
          onInformationClick={(placeDetails) =>
            this.callbackInterceptor?.onInformationButtonClick?.(placeDetails)
          }
          onShareClick={(sharelink: string) => {
            Share.share({
              message: sharelink,
            })
          }}
          onWebsiteClick={(website: string) => Linking.openURL(`${website}`)}
          onPhoneClick={(phone: string) => Linking.openURL(`tel:${phone}`)}
          onPlaceClick={(
            place: LatLngFloor | Place | PlacePreview | VenuePreview | Venue
          ) => this.mapwizeMap?.centerOn(place)}
          onDirectionToPlaceClick={(place: any) =>
            this.store?.selectPlaceAndGoDirection(place)
          }
          uses24={this.uiOptions.uses24}
        />
      </SafeAreaProvider>
    )
  }
}

export interface UIControllerState {
  status: 'default' | 'inSearch' | 'inFromSearch' | 'inToSearch' | 'inDirection'
  venue?: Venue
  lastExitedVenue?: any
  selectedContent?: Place | PlacePreview | VenuePreview | Placelist
  directionFromPoint?: DirectionPointWrapper
  directionToPoint?: DirectionPointWrapper
  directionMode?: DirectionMode
  direction?: Direction
  floors: Floor[]
  preferredLanguage: string
  language: string
  unit: string
  heading: number
  mainColor: string
}
export interface MapwizeMapState {
  /**
   * The user current location
   */
  userLocation?: LatLngFloor | undefined
  /**
   * Markers that are currently displayed on the map.
   */
  markers?: MarkerProp[] | undefined
  /**
   * Place that is currently selected on the map
   */
  selectedPlace?: any
  /**
   * Direction that is currentrly displayed on the map
   */
  mapDirection?: DirectionProp | undefined
  /**
   * Navigation that is currentrly displayed on the map
   */
  mapNavigation?: NavigationProp | undefined
}

export interface MapwizeUIState {
  mapwizeMapState: MapwizeMapState
  uiControllerState: UIControllerState
  universeSelectorState: UniverseSelectorState
  languageSelectorState: LanguageSelectorState
  searchContainerState: SearchContainerState
  searchBarState: SearchBarState
  searchResultListState: SearchResultListState
  searchDirectionBarState: SearchDirectionBarState
  floorControllerState: FloorControllerState
  bottomViewState: BottomViewState
  followUserButtonState: FollowUserButtonState
}

const buildDefaultState = (options: UIOptions): MapwizeUIState => {
  options.preferredLanguage = options.preferredLanguage || 'en'
  const state: MapwizeUIState = {
    mapwizeMapState: {},
    uiControllerState: {
      status: 'default',
      floors: [],
      preferredLanguage: options.preferredLanguage,
      language: options.preferredLanguage,
      unit: options.unit ? options.unit : 'm',
      mainColor: options.mainColor,
      heading: 0,
    },
    universeSelectorState: buildDefaultUniverseSelectorState(options),
    languageSelectorState: buildDefaultLanguageSelectorState(options),
    searchContainerState: {
      isInSearch: false,
      mainColor: options.mainColor,
    },
    searchBarState: {
      isInSearch: false,
      isHidden: false,
      searchQuery: '',
      searchPlaceholder: lang_search_global(options.preferredLanguage),
      directionButtonHidden: true,
      menuTooltipMessage: lang_menu(options.preferredLanguage),
      backTooltipMessage: lang_back(options.preferredLanguage),
      directionTooltipMessage: lang_direction(options.preferredLanguage),
      mainColor: options.mainColor,
    },
    searchResultListState: {
      isInDirectionSearch: false,
      isHidden: true,
      showCurrentLocation: undefined,
      noResultLabel: lang_search_no_results(options.preferredLanguage),
      universes: [],
      currentUniverse: undefined,
      mainColor: options.mainColor,
    },
    searchDirectionBarState: {
      isHidden: true,
      fromPlaceholder: lang_choose_starting_point(options.preferredLanguage),
      toPlaceholder: lang_choose_destination(options.preferredLanguage),
      fromQuery: '',
      toQuery: '',
      modes: [],
      selectedMode: undefined,
      isInSearch: false,
      isToFocus: false,
      isFromFocus: false,
      mainColor: options.mainColor,
    },
    floorControllerState: buildDefaultFloorControllerState(options),
    bottomViewState: {
      expanded: false,
      hidden: true,
      language: options.preferredLanguage,
      mainColor: options.mainColor,
    },
    followUserButtonState: {
      followUserMode: new FollowUserMode('none'),
      tooltipMessage: 'Use my location',
      mainColor: options.mainColor,
    },
  }
  return state
}

const configureStateFromApi = async (
  state: MapwizeUIState,
  options: UIOptions,
  apiService: ApiService
): Promise<MapwizeUIState> => {
  if (options.mapOptions?.centerOnPlaceId !== undefined) {
    const place = await apiService.getPlaceWithId(
      options.mapOptions?.centerOnPlaceId
    )
    const details = await apiService.getPlaceDetailsWithId(
      options.mapOptions?.centerOnPlaceId
    )
    state.bottomViewState.content = buildPlaceDetails(
      details,
      state.uiControllerState.preferredLanguage
    )
    state.bottomViewState.hidden = false
    state.uiControllerState.selectedContent = place
  }
  return Promise.resolve(state)
}

const buildDefaultUniverseSelectorState = (
  options: UIOptions
): UniverseSelectorState => {
  return {
    isExpanded: false,
    isHidden: false,
    universes: [],
    selectedUniverse: undefined,
    tooltipMessage: lang_change_universe(options.preferredLanguage || 'en'),
    mainColor: options.mainColor,
  }
}
const buildDefaultLanguageSelectorState = (
  options: UIOptions
): LanguageSelectorState => {
  return {
    isExpanded: false,
    isHidden: false,
    languages: [],
    selectedLanguage: options.preferredLanguage,
    tooltipMessage: lang_change_language(options.preferredLanguage || 'en'),
    mainColor: options.mainColor,
  }
}
const buildDefaultFloorControllerState = (
  options: UIOptions
): FloorControllerState => {
  return {
    floors: [],
    selectedFloor: null,
    loadingFloor: null,
    tooltipMessage: lang_floor_controller(options.preferredLanguage || 'en'),
    mainColor: options.mainColor,
  }
}

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  middleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  middleLeftContainer: {
    flexDirection: 'row',
    paddingLeft: 16,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  middleRightContainer: {
    paddingRight: 16,
  },
  middleRightBottomContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  middleRightTopContainer: {
    padding: 8,
    backgroundColor: 'green',
    marginBottom: 16,
  },
  floorController: {
    alignSelf: 'flex-end',
    flex: 1,
  },
  followUserButton: {
    elevation: 6,
    zIndex: 6,
    alignSelf: 'flex-end',
  },
  searchContainer: {
    zIndex: 8,
  },
  searchBar: {},
  searchDirectionBar: {},
  searchResultList: {},
  universeSelector: {
    marginRight: 8,
  },
  languageSelector: {},
  bottomView: {},
  bottomViewVisible: {
    marginBottom: 0,
    paddingBottom: 16,
  },
})
