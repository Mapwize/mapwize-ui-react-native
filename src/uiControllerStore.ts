/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import produce from 'immer'
import type { WritableDraft } from 'immer/dist/internal'

import type { Floor, SearchResult } from './types'
import type { MapwizeUIState } from './uiController'
import type MapActionsDispatcher from './mapActionsDispatcher'
import {
  buildDirectionError,
  buildDirectionInfo,
  buildFloorDisplays,
  buildLanguageDisplay,
  buildLanguageDisplays,
  buildNavigationInfo,
  buildPlaceDetails,
  buildPlacelistDetails,
  buildSearchResult,
  titleForLanguage,
} from './formatter'
import type { DevCallbackInterceptor } from './devCallbackInterceptor'
import type { ApiService } from './apiService'
import {
  lang_available_locale,
  lang_back,
  lang_change_language,
  lang_change_universe,
  lang_choose_destination,
  lang_choose_starting_point,
  lang_coordinates,
  lang_current_location,
  lang_destination,
  lang_direction,
  lang_entering_venue,
  lang_floor_controller,
  lang_search_global,
  lang_search_no_results,
  lang_search_venue,
  lang_start,
  Locale,
} from './localizor'
import {
  Camera,
  Direction,
  DirectionMode,
  DirectionOptions,
  DirectionPointWrapper,
  DirectionProp,
  NavigationInfo,
  NavigationProp,
  Place,
  PlaceDetails,
  Placelist,
  PlacePreview,
  Universe,
} from 'mapwize-sdk-react-native'

export class UIControllerStore {
  private render: (oldState: MapwizeUIState, newState: MapwizeUIState) => void
  public state: MapwizeUIState
  private mapActionsDispatcher: MapActionsDispatcher
  private devCallbackInterceptor: DevCallbackInterceptor
  private apiService: ApiService

  constructor(
    defaultState: MapwizeUIState,
    render: (oldState: MapwizeUIState, newState: MapwizeUIState) => void,
    mapActionsDispatcher: MapActionsDispatcher,
    apiService: ApiService,
    devCallbackInterceptor: DevCallbackInterceptor
  ) {
    this.render = render
    this.state = defaultState
    this.mapActionsDispatcher = mapActionsDispatcher
    this.apiService = apiService
    this.devCallbackInterceptor = devCallbackInterceptor
  }

  public getLocale(): Locale | undefined {
    return lang_available_locale().find(
      (l) => l.code === this.state.uiControllerState.preferredLanguage
    )
  }

  public getAvailableLocales(): Locale[] {
    return lang_available_locale()
  }

  public async setLocale(locale: string) {
    if (
      !lang_available_locale()
        .map((l) => l.code)
        .includes(locale)
    ) {
      return
    }
    const nextState = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.preferredLanguage = locale
        draftState.universeSelectorState.tooltipMessage = lang_change_universe(
          locale
        )
        draftState.languageSelectorState.tooltipMessage = lang_change_language(
          locale
        )
        draftState.floorControllerState.tooltipMessage = lang_floor_controller(
          locale
        )
        draftState.searchBarState.backTooltipMessage = lang_back(locale)
        draftState.searchBarState.directionTooltipMessage = lang_direction(
          locale
        )
        draftState.searchResultListState.noResultLabel = lang_search_no_results(
          locale
        )
        if (this.state.uiControllerState.venue) {
          draftState.searchBarState.searchPlaceholder = lang_search_venue(
            locale,
            titleForLanguage(this.state.uiControllerState.venue, locale)
          )
        } else {
          draftState.searchBarState.searchPlaceholder = lang_search_global(
            locale
          )
        }
        draftState.searchDirectionBarState.fromPlaceholder = lang_choose_starting_point(
          locale
        )
        draftState.searchDirectionBarState.toPlaceholder = lang_choose_destination(
          locale
        )
        if (this.state.uiControllerState.directionFromPoint) {
          if (
            this.state.uiControllerState.directionFromPoint.objectClass ===
            'Place'
          ) {
            draftState.searchDirectionBarState.fromQuery = titleForLanguage(
              this.state.uiControllerState.directionFromPoint,
              locale
            )
          } else {
            draftState.searchDirectionBarState.fromQuery = lang_coordinates(
              locale
            )
          }
        }
        if (this.state.uiControllerState.directionToPoint) {
          if (
            this.state.uiControllerState.directionToPoint.objectClass ===
              'Place' ||
            this.state.uiControllerState.directionToPoint.objectClass ===
              'Placelist'
          ) {
            draftState.searchDirectionBarState.toQuery = titleForLanguage(
              this.state.uiControllerState.directionToPoint,
              locale
            )
          } else {
            draftState.searchDirectionBarState.toQuery = lang_coordinates(
              locale
            )
          }
        }
        draftState.bottomViewState.language = locale
        if (this.state.uiControllerState.selectedContent) {
          if (
            this.state.uiControllerState.selectedContent.objectClass ===
              'Place' ||
            this.state.uiControllerState.selectedContent.objectClass ===
              'PlaceDetails'
          ) {
            const details = await this.apiService.getPlaceDetailsWithId(
              this.state.uiControllerState.selectedContent._id
            )
            draftState.bottomViewState.content = buildPlaceDetails(
              details,
              locale
            )
          }
          if (
            this.state.uiControllerState.selectedContent.objectClass ===
            'Placelist'
          ) {
            const places = await this.apiService.getPlacesForPlacelist(
              this.state.uiControllerState.selectedContent as any
            )
            draftState.bottomViewState.content = buildPlacelistDetails(
              this.state.uiControllerState.selectedContent,
              places,
              locale
            )
          }
        }
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
    this.mapActionsDispatcher.setLanguage(locale)
  }

  public setUnit(unit: string) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.unit = unit
        if (this.state.uiControllerState.direction) {
          draftState.bottomViewState.directionContent = buildDirectionInfo(
            this.state.uiControllerState.direction,
            unit
          )
        }
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public getUnit(): string {
    return this.state.uiControllerState.unit
  }

  public getUnits(): string[] {
    return ['m', 'ft']
  }

  public setLanguage(language: string) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.language = language
        draftState.universeSelectorState.tooltipMessage = lang_change_universe(
          language
        )
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public toggleUniverseSelector() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.universeSelectorState.isExpanded = !this.state
          .universeSelectorState.isExpanded
        draftState.languageSelectorState.isExpanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeSelectedUniverse(universe: Universe) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.universeSelectorState.isExpanded = false
        draftState.universeSelectorState.selectedUniverse = universe
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public toggleLanguageSelector() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.languageSelectorState.isExpanded = !this.state
          .languageSelectorState.isExpanded
        draftState.universeSelectorState.isExpanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async directionButtonClick() {
    if (!this.state.uiControllerState.venue) {
      this.mapActionsDispatcher.fireError(
        'Must be inside venue to enter in direction'
      )
      return
    }
    const nextState = await produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.defaultToDirection(draftState)
      }
    )

    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
    this.tryToStartDirection()

    if (!this.state.uiControllerState.directionFromPoint) {
      this.directionSearchFromQueryChange('')
    } else if (!this.state.uiControllerState.directionToPoint) {
      this.directionSearchToQueryChange('')
    }
  }

  public directionFromBlur() {
    setTimeout(() => {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeUIState>) => {
          draftState.searchDirectionBarState.isFromFocus = false
          if (
            !this.state.searchDirectionBarState.isFromFocus &&
            !this.state.searchDirectionBarState.isToFocus
          ) {
            draftState.searchResultListState.isHidden = true
            draftState.searchResultListState.results = undefined
            draftState.searchResultListState.universes = []
            draftState.searchResultListState.currentUniverse = undefined
            draftState.searchResultListState.showCurrentLocation = undefined
            draftState.searchContainerState.isInSearch = false
          }
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
    }, 250)
  }

  public directionToBlur() {
    setTimeout(() => {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeUIState>) => {
          draftState.searchDirectionBarState.isToFocus = false
          if (
            !this.state.searchDirectionBarState.isFromFocus &&
            !this.state.searchDirectionBarState.isToFocus
          ) {
            draftState.searchResultListState.isHidden = true
            draftState.searchResultListState.results = undefined
            draftState.searchResultListState.universes = []
            draftState.searchResultListState.currentUniverse = undefined
            draftState.searchResultListState.showCurrentLocation = undefined
            draftState.searchContainerState.isInSearch = false
          }
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
    }, 250)
  }

  public async directionFromFocus() {
    const nextState = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchContainerState.isInSearch = true
        draftState.searchDirectionBarState.isFromFocus = true
        draftState.searchDirectionBarState.isToFocus = false
        draftState.uiControllerState.status = 'inFromSearch'
        draftState.bottomViewState.hidden = true
        if (
          this.state.searchDirectionBarState.fromQuery ===
          lang_current_location(this.state.uiControllerState.preferredLanguage)
        ) {
          draftState.searchDirectionBarState.fromQuery = ''
        }
        await this.setMainFroms(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async directionToFocus() {
    const nextState = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchContainerState.isInSearch = true
        draftState.searchDirectionBarState.isToFocus = true
        draftState.searchDirectionBarState.isFromFocus = false
        draftState.uiControllerState.status = 'inToSearch'
        draftState.bottomViewState.hidden = true
        await this.setMainFroms(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public directionBackButtonClick() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.directionToDefault(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeDirectionModes(modes: DirectionMode[]) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchDirectionBarState.modes = modes

        if (
          !draftState.uiControllerState.directionMode ||
          (draftState.uiControllerState.directionMode &&
            !modes
              .map((mode) => mode._id)
              .includes(draftState.uiControllerState.directionMode?._id))
        ) {
          draftState.searchDirectionBarState.selectedMode = modes[0]
          draftState.uiControllerState.directionMode = modes[0]
        } else {
          draftState.searchDirectionBarState.selectedMode = this.state.uiControllerState.directionMode
        }
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeDirectionMode(mode: DirectionMode) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchDirectionBarState.selectedMode = mode
        draftState.uiControllerState.directionMode = mode
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.tryToStartDirection()
  }

  public searchBackButtonClick() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.searchToDefault(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public searchResultsChange(results: SearchResult[]) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchResultListState.results = results
        draftState.searchResultListState.showCurrentLocation = undefined
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public searchFocus() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.defaultToSearch(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async setMainFroms(draftState: WritableDraft<MapwizeUIState>) {
    const searchResults = await this.apiService.getMainFroms(
      this.state.uiControllerState?.venue
    )
    draftState.searchResultListState.results = buildSearchResult(
      searchResults,
      this.state.uiControllerState.language
    )
    draftState.searchResultListState.showCurrentLocation = this.mapActionsDispatcher.hasIndoorLocation()
      ? lang_current_location(this.state.uiControllerState.preferredLanguage)
      : undefined
  }

  public async setMainSearches(draftState: WritableDraft<MapwizeUIState>) {
    const searchResults = await this.apiService.getMainSearches(
      this.state.uiControllerState.venue
    )
    draftState.searchResultListState.results = buildSearchResult(
      searchResults,
      this.state.uiControllerState.language
    )
    draftState.searchResultListState.showCurrentLocation = undefined
  }

  public searchBlur() {
    setTimeout(() => {
      if (
        !this.state.searchDirectionBarState.isFromFocus &&
        !this.state.searchDirectionBarState.isToFocus
      ) {
        const nextState = produce(
          this.state,
          (draftState: WritableDraft<MapwizeUIState>) => {
            this.searchToDefault(draftState)
          }
        )
        const oldState = this.state
        this.state = nextState
        this.render(oldState, nextState)
      }
    }, 500)
  }

  public async searchQueryChange(query: string) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchBarState.searchQuery = query
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    let searchResults: any
    if (this.state.uiControllerState.venue) {
      const searchParams = {
        query,
        objectClasses: ['place', 'placeList'],
        venueId: this.state.uiControllerState.venue._id,
      }
      if (query.length === 0) {
        searchResults = await this.apiService.getMainSearches(
          this.state.uiControllerState.venue
        )
      } else {
        searchResults = await this.apiService.search(searchParams)
      }
    } else {
      const searchParams = { query, objectClasses: ['venue'] }
      searchResults = await this.apiService.search(searchParams)
    }
    const nextStateAsync = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchResultListState.results = buildSearchResult(
          searchResults,
          this.state.uiControllerState.language
        )
        draftState.searchResultListState.universes = this.state.universeSelectorState.universes
        draftState.searchResultListState.currentUniverse = this.state.universeSelectorState.selectedUniverse
        draftState.searchResultListState.showCurrentLocation = undefined
      }
    )
    const oldStateAsync = this.state
    this.state = nextStateAsync
    this.render(oldStateAsync, nextStateAsync)
  }

  public async directionSearchFromQueryChange(query: string) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchContainerState.isInSearch = true
        draftState.searchDirectionBarState.isInSearch = true
        draftState.searchDirectionBarState.fromQuery = query
        draftState.searchResultListState.isHidden = false
        draftState.searchResultListState.isInDirectionSearch = true
        draftState.bottomViewState.hidden = true
        draftState.uiControllerState.status = 'inFromSearch'
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    const searchParams = {
      query,
      objectClasses: ['place'],
      universeId: this.state.universeSelectorState.selectedUniverse?._id,
      venueId: this.state.uiControllerState.venue?._id,
    }
    let searchResults: any
    if (query.length === 0) {
      searchResults = await this.apiService.getMainFroms(
        this.state.uiControllerState.venue
      )
    } else {
      searchResults = await this.apiService.search(searchParams)
    }

    const nextStateAsync = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchResultListState.results = buildSearchResult(
          searchResults,
          this.state.uiControllerState.language
        )
        draftState.searchResultListState.showCurrentLocation = this.mapActionsDispatcher.hasIndoorLocation()
          ? lang_current_location(
              this.state.uiControllerState.preferredLanguage
            )
          : undefined
        draftState.searchResultListState.universes = []
        draftState.searchResultListState.currentUniverse = undefined
      }
    )
    const oldStateAsync = this.state
    this.state = nextStateAsync
    this.render(oldStateAsync, nextStateAsync)
  }

  public async directionSearchToQueryChange(query: string) {
    this.generic((draftState: WritableDraft<MapwizeUIState>) => {
      draftState.searchContainerState.isInSearch = true
      draftState.searchDirectionBarState.isInSearch = true
      draftState.searchDirectionBarState.toQuery = query
      draftState.searchResultListState.isHidden = false
      draftState.searchResultListState.isInDirectionSearch = true
      draftState.bottomViewState.hidden = true
      draftState.uiControllerState.status = 'inToSearch'
    })

    const searchParams = {
      query,
      objectClasses: ['place', 'placelist'],
      universeId: this.state.universeSelectorState.selectedUniverse?._id,
      venueId: this.state.uiControllerState.venue?._id,
    }
    let searchResults: any
    if (query.length === 0) {
      searchResults = await this.apiService.getMainSearches(
        this.state.uiControllerState.venue
      )
    } else {
      searchResults = await this.apiService.search(searchParams)
    }

    const nextStateAsync = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchResultListState.results = buildSearchResult(
          searchResults,
          this.state.uiControllerState.language
        )
        draftState.searchResultListState.showCurrentLocation = undefined
        draftState.searchResultListState.universes = []
        draftState.searchResultListState.currentUniverse = undefined
      }
    )
    const oldStateAsync = this.state
    this.state = nextStateAsync
    this.render(oldStateAsync, nextStateAsync)
  }

  // TODO use it everywhere
  private generic(
    producer: (draftState: WritableDraft<MapwizeUIState>) => void
  ) {
    const nextState = produce(this.state, producer)
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public selectSearchResult(
    result: SearchResult,
    universe?: Universe | undefined
  ) {
    if (this.state.uiControllerState.status === 'inFromSearch') {
      this.selectFrom(result)
      if (
        this.state.searchDirectionBarState.toQuery === undefined ||
        this.state.searchDirectionBarState.toQuery === ''
      ) {
        this.directionSearchToQueryChange('')
      }
    } else if (this.state.uiControllerState.status === 'inToSearch') {
      // this.devCallbackInterceptor.onSelectedChange?.(result, {
      //   channel: 'search',
      //   searchQuery: this.state.searchDirectionBarState.toQuery,
      // })
      this.selectTo(result)
    } else if (this.state.uiControllerState.status === 'inSearch') {
      // this.devCallbackInterceptor.onSelectedChange?.(result, {
      //   channel: 'search',
      //   searchQuery: this.state.searchBarState.searchQuery,
      // })
      this.selectDefaultSearchResult(result, universe)
    }
  }

  private async selectDefaultSearchResult(
    result: SearchResult,
    universe?: Universe | undefined
  ) {
    if (result.objectClass === 'Place') {
      await this.selectPlace(result)
      this.mapActionsDispatcher.centerOnPlace(result)
      if (universe) {
        this.mapActionsDispatcher.setUniverse(universe)
      }
    }
    if (result.objectClass === 'Placelist') {
      this.selectPlacelist(result)
      // TODO Verify this.mapActionsDispatcher.selectPlacelist(result, { channel: 'search', searchQuery: this.state.searchBarState.searchQuery })
    }
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchResultListState.isHidden = true
        draftState.searchBarState.isInSearch = false
        draftState.searchBarState.searchQuery = ''
        draftState.searchContainerState.isInSearch = false
        draftState.uiControllerState.status = 'default'
        draftState.searchResultListState.results = undefined
        draftState.searchResultListState.universes = []
        draftState.searchResultListState.currentUniverse = undefined
        draftState.searchResultListState.showCurrentLocation = undefined
        /*if (result.objectClass === 'Placelist') {
        draftState.bottomViewState.content = buildPlacelist(result, this.state.uiControllerState.language)
        draftState.bottomViewState.hidden = false
        draftState.uiControllerState.selectedContent = result
        draftState.languageSelectorState.isHidden = true
        draftState.universeSelectorState.isHidden = true
      }*/
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    if (result.objectClass === 'Venue') {
      this.mapActionsDispatcher.centerOnVenue(result as any)
    }
    /*if (result.objectClass === 'Placelist') {
      this.mapActionsDispatcher.selectPlacelist(result)
      this.mapActionsDispatcher.centerOnPlacelist(result)
    }*/
  }

  public selectCurrentLocation() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.directionFromPoint = this.mapActionsDispatcher.getUserLocation()
        draftState.searchDirectionBarState.fromQuery = lang_current_location(
          this.state.uiControllerState.preferredLanguage
        )
        this.setNextDirectionStep(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.tryToStartDirection()
  }

  private async selectFrom(result: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.setFromSelected(draftState, result)
        this.setNextDirectionStep(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.tryToStartDirection()
  }

  private async selectTo(result: any) {
    if (result.objectClass === 'Place') {
      // this.selectPlace(result);
    }
    if (result.objectClass === 'Placelist') {
      this.selectPlacelist(result)
    }
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        this.setToSelected(draftState, result)
        this.setNextDirectionStep(draftState)
        /*if (result.objectClass === 'Placelist') {
        draftState.bottomViewState.content = buildPlacelist(result, this.state.uiControllerState.language)
        draftState.bottomViewState.hidden = false
        draftState.uiControllerState.selectedContent = result
        draftState.languageSelectorState.isHidden = true
        draftState.universeSelectorState.isHidden = true
      }*/
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.tryToStartDirection()
  }

  public willEnterInVenue(venue: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchBarState.searchPlaceholder = lang_entering_venue(
          this.state.uiControllerState.language,
          venue.name
        )
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public enterInVenue(venue: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        if (this.state.uiControllerState.direction) {
          if (
            !this.state.uiControllerState.lastExitedVenue ||
            venue._id === this.state.uiControllerState.lastExitedVenue._id
          ) {
            this.enterVenueInDirection(draftState)
          } else {
            this.directionToDefault(draftState)
          }
        }
        if (this.state.uiControllerState.selectedContent) {
          // this.devCallbackInterceptor.onSelectedChange?.(
          //   this.state.uiControllerState.selectedContent
          // )
          if (
            !this.state.uiControllerState.lastExitedVenue ||
            venue._id === this.state.uiControllerState.lastExitedVenue._id
          ) {
            this.enterVenueInSelectedContent(draftState)
            console.log(
              'this.state.uiControllerState.selectedContent.objectClass',
              this.state.uiControllerState.selectedContent.objectClass
            )
            if (
              this.state.uiControllerState.selectedContent.objectClass ===
                'Place' ||
              this.state.uiControllerState.selectedContent.objectClass ===
                'PlaceDetails'
            ) {
              setTimeout(
                () =>
                  this.mapActionsDispatcher.selectPlace(
                    this.state.uiControllerState.selectedContent as any,
                    true
                  ),
                500
              )
            } else if (
              this.state.uiControllerState.selectedContent.objectClass ===
              'Placelist'
            ) {
              setTimeout(
                () =>
                  this.mapActionsDispatcher.selectPlacelist(
                    this.state.uiControllerState.selectedContent as any
                  ),
                500
              )
            }
          } else {
            draftState.mapwizeMapState.selectedPlace = undefined
            draftState.uiControllerState.selectedContent = undefined
            draftState.bottomViewState.content = undefined
            draftState.bottomViewState.expanded = false
            draftState.bottomViewState.hidden = true
            draftState.languageSelectorState.isHidden =
              draftState.languageSelectorState.languages.length <= 1
            draftState.universeSelectorState.isHidden =
              draftState.universeSelectorState.universes.length <= 1
            this.mapActionsDispatcher.unselectContent()
          }
        }
        draftState.searchBarState.searchPlaceholder = lang_search_venue(
          this.state.uiControllerState.language,
          titleForLanguage(venue, this.state.uiControllerState.language)
        )
        draftState.uiControllerState.venue = venue
        draftState.searchBarState.directionButtonHidden = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public exitVenue(venue: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchBarState.searchPlaceholder = lang_search_global(
          this.state.uiControllerState.language
        )
        draftState.uiControllerState.lastExitedVenue = venue
        draftState.uiControllerState.venue = undefined
        draftState.searchBarState.directionButtonHidden = true
        if (this.state.uiControllerState.direction) {
          this.directionToExitVenue(draftState)
        } else if (this.state.uiControllerState.selectedContent) {
          //TODO see why this is here
          // this.directionToDefault(draftState);
          this.selectedContentToExitVenue(draftState)
        } else {
          //TODO see why this is here
          // this.directionToDefault(draftState);
          // this.searchToDefault(draftState);
        }
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeFloors(floors: Floor[]) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.floors = floors
        draftState.floorControllerState.floors = buildFloorDisplays(
          floors,
          this.state.uiControllerState.language
        )
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public loadFloor(floor: number) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.floorControllerState.loadingFloor = floor
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeFloor(floor: number | null) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.floorControllerState.loadingFloor = undefined
        draftState.floorControllerState.selectedFloor = floor
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeUniverses(universes: Universe[]) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.universeSelectorState.universes = universes
        draftState.universeSelectorState.isHidden = universes.length <= 1
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public loadUniverse(universe: Universe) {
    // TODO
  }

  public changeUniverse(universe: Universe) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.universeSelectorState.selectedUniverse = universe
        draftState.universeSelectorState.isExpanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeLanguages(languages: string[]) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.languageSelectorState.languages = buildLanguageDisplays(
          languages
        )
        draftState.languageSelectorState.isHidden = languages.length <= 1
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public changeLanguage(language: string) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.languageSelectorState.selectedLanguage = buildLanguageDisplay(
          language
        )
        draftState.languageSelectorState.isExpanded = false
        draftState.uiControllerState.language = language
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public selectContent(content: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.selectedContent = content
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async externalSelectPlace(place: any): Promise<void> {
    this.selectPlace(place)
    return this.mapActionsDispatcher.centerOnPlace(place)
    // .then(() => {
    //   this.devCallbackInterceptor.onSelectedChange?.(place, {
    //     channel: 'method',
    //   })
    // })
  }
  public async externalSelectPlacelist(placelist: any): Promise<void> {
    this.selectPlacelist(placelist)
    return this.mapActionsDispatcher.centerOnPlacelist(placelist)
    // .then(() => {
    //   this.devCallbackInterceptor.onSelectedChange?.(placelist, {
    //     channel: 'method',
    //   })
    // })
  }

  public onPlaceClick(place: any) {
    if (this.state.uiControllerState.status === 'default') {
      this.selectPlace(place)
      // this.devCallbackInterceptor.onSelectedChange?.(place, {
      //   channel: 'click',
      // })
    }
    if (this.state.uiControllerState.status === 'inFromSearch') {
      this.selectFrom(place)
      return
    } else if (this.state.uiControllerState.status === 'inToSearch') {
      this.selectTo(place)
      // this.devCallbackInterceptor.onSelectedChange?.(place, {
      //   channel: 'click',
      // })
      return
    } else if (this.state.uiControllerState.status === 'inDirection') {
      return
    }
  }

  public onVenueClick(venue: any) {
    this.mapActionsDispatcher.centerOnVenue(venue)
  }

  public onMapClick(coordinate: any) {
    if (this.state.uiControllerState.status === 'default') {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeUIState>) => {
          draftState.mapwizeMapState.selectedPlace = undefined
          draftState.uiControllerState.selectedContent = undefined
          draftState.bottomViewState.content = undefined
          draftState.bottomViewState.expanded = false
          draftState.bottomViewState.hidden = true
          draftState.languageSelectorState.isExpanded = false
          draftState.languageSelectorState.isHidden =
            draftState.languageSelectorState.languages.length <= 1
          draftState.universeSelectorState.isExpanded = false
          draftState.universeSelectorState.isHidden =
            draftState.universeSelectorState.universes.length <= 1
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
      this.mapActionsDispatcher.unselectContent()
      // this.devCallbackInterceptor.onSelectedChange?.(undefined)
    } else if (
      this.state.uiControllerState.status === 'inFromSearch' &&
      this.state.searchDirectionBarState.isFromFocus
    ) {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeUIState>) => {
          this.setFromCoordinateSelected(draftState, coordinate)
          this.setNextDirectionStep(draftState)
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
      this.tryToStartDirection()
    } else if (
      this.state.uiControllerState.status === 'inToSearch' &&
      this.state.searchDirectionBarState.isToFocus
    ) {
      const nextState = produce(
        this.state,
        (draftState: WritableDraft<MapwizeUIState>) => {
          this.setToCoordinateSelected(draftState, coordinate)
          this.setNextDirectionStep(draftState)
        }
      )
      const oldState = this.state
      this.state = nextState
      this.render(oldState, nextState)
      this.tryToStartDirection()
    }
  }

  public toggleBottomViewExpand() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.bottomViewState.expanded = !draftState.bottomViewState
          .expanded
        draftState.searchBarState.isHidden = draftState.bottomViewState.expanded
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async selectPlace(placePreview: any) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        if (this.state.uiControllerState.venue) {
          draftState.bottomViewState.hidden = false
          draftState.languageSelectorState.isHidden = true
          draftState.universeSelectorState.isHidden = true
        }
        draftState.bottomViewState.content = {
          ...placePreview,
          titleLabel: placePreview?.title,
          subtitleLabel: placePreview?.subtitle,
        }
        draftState.uiControllerState.selectedContent = placePreview
        draftState.mapwizeMapState.selectedPlace = placePreview
        draftState.mapwizeMapState.markers = []
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    await this.getDetailsForPlacePreview({ ...placePreview })
  }

  private async getDetailsForPlacePreview(
    placePreview: PlacePreview | Placelist | Place
  ) {
    let place = placePreview
    let details: any = placePreview
    if (placePreview.objectClass === 'PlacePreview') {
      place = await this.apiService.getPlace(placePreview as PlacePreview)
      details = await this.apiService.getPlaceDetails(
        placePreview as PlacePreview
      )
    } else if (placePreview.objectClass === 'Place') {
      details = await this.apiService.getPlaceDetails(
        placePreview as PlacePreview
      )
    } else {
      console.log('placePreview.objectClass', placePreview.objectClass)
    }

    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        if (this.state.uiControllerState.venue) {
          draftState.bottomViewState.hidden = false
          draftState.languageSelectorState.isHidden = true
          draftState.universeSelectorState.isHidden = true
        }
        draftState.bottomViewState.content = buildPlaceDetails(
          details,
          this.state.uiControllerState.language
        )
        draftState.uiControllerState.selectedContent = place
        draftState.mapwizeMapState.selectedPlace = place
        draftState.mapwizeMapState.markers = []
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public async selectPlaceAndGoDirection(place: any) {
    if (this.state.mapwizeMapState.selectedPlace?._id !== place?._id) {
      await this.selectPlace(place)
    }
    this.directionButtonClick()
    this.tryToStartDirection()
  }

  private async selectPlacelist(placelist: any) {
    const places = await this.apiService.getPlacesForPlacelist(placelist)

    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        if (this.state.uiControllerState.venue) {
          draftState.bottomViewState.hidden = false
          draftState.languageSelectorState.isHidden = true
          draftState.universeSelectorState.isHidden = true
        }
        draftState.bottomViewState.content = buildPlacelistDetails(
          placelist,
          places,
          this.state.uiControllerState.language
        )
        draftState.uiControllerState.selectedContent = placelist
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
    if (this.state.uiControllerState.status !== 'inDirection') {
      this.mapActionsDispatcher.selectPlacelist(placelist)
    }
  }

  public getFrom(): any {
    return this.state.uiControllerState.directionFromPoint
  }

  public getTo(): any {
    return this.state.uiControllerState.directionToPoint
  }

  public setMode(modeId: string) {
    const mode = this.state.searchDirectionBarState.modes.find(
      (m) => m._id === modeId
    )
    if (!mode) {
      console.error('Mode does not exist in this venue')
      return
    }
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchDirectionBarState.selectedMode = mode
        draftState.uiControllerState.directionMode = mode
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.tryToStartDirection()
  }

  private setFromSelected(
    draftState: WritableDraft<MapwizeUIState>,
    from: any
  ) {
    draftState.uiControllerState.directionFromPoint = from
    draftState.searchDirectionBarState.fromQuery =
      titleForLanguage(from, draftState.uiControllerState.language) || ''
  }

  private setFromCoordinateSelected(
    draftState: WritableDraft<MapwizeUIState>,
    from: any
  ) {
    draftState.uiControllerState.directionFromPoint = from
    draftState.searchDirectionBarState.fromQuery = lang_coordinates(
      this.state.uiControllerState.language
    )
  }

  private setToSelected(draftState: WritableDraft<MapwizeUIState>, to: any) {
    draftState.uiControllerState.directionToPoint = to
    draftState.searchDirectionBarState.toQuery =
      titleForLanguage(to, draftState.uiControllerState.language) || ''
  }

  private setToCoordinateSelected(
    draftState: WritableDraft<MapwizeUIState>,
    to: any
  ) {
    draftState.uiControllerState.directionToPoint = to
    draftState.searchDirectionBarState.toQuery = lang_coordinates(
      this.state.uiControllerState.language
    )
  }

  private setNextDirectionStep(draftState: WritableDraft<MapwizeUIState>) {
    if (!draftState.uiControllerState.directionFromPoint) {
      draftState.searchDirectionBarState.isFromFocus = true
      draftState.searchResultListState.results = undefined
      draftState.searchResultListState.universes = []
      draftState.searchResultListState.currentUniverse = undefined
      draftState.searchResultListState.showCurrentLocation = undefined
    } else if (!draftState.uiControllerState.directionToPoint) {
      draftState.searchDirectionBarState.isToFocus = true
      draftState.searchResultListState.results = undefined
      draftState.searchResultListState.universes = []
      draftState.searchResultListState.currentUniverse = undefined
      draftState.searchResultListState.showCurrentLocation = undefined
    } else {
      draftState.searchResultListState.isInDirectionSearch = false
      draftState.searchResultListState.isHidden = true
      draftState.searchResultListState.results = undefined
      draftState.searchResultListState.universes = []
      draftState.searchResultListState.currentUniverse = undefined
      draftState.searchResultListState.showCurrentLocation = undefined
      draftState.searchContainerState.isInSearch = false
      draftState.uiControllerState.status = 'inDirection'
    }
  }

  public onCameraChange(camera: Camera) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.uiControllerState.heading = camera.bearing
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public swapFromAndTo() {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        const oldFrom = this.state.uiControllerState.directionFromPoint
        const oldTo = this.state.uiControllerState.directionToPoint
        const oldFromQuery = this.state.searchDirectionBarState.fromQuery
        const oldToQuery = this.state.searchDirectionBarState.toQuery
        if (oldTo?.objectClass === 'Placelist') {
          draftState.uiControllerState.directionFromPoint = undefined
          draftState.searchDirectionBarState.fromQuery = ''
        } else {
          draftState.uiControllerState.directionFromPoint = oldTo
          draftState.searchDirectionBarState.fromQuery = oldToQuery
        }
        draftState.uiControllerState.directionToPoint = oldFrom
        draftState.searchDirectionBarState.toQuery = oldFromQuery
        if (
          oldFrom?.objectClass === 'Place' ||
          oldFrom?.objectClass === 'PlaceDetails'
        ) {
          this.selectPlace(oldFrom as any)
        }
        this.setNextDirectionStep(draftState)
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
    this.tryToStartDirection()
  }

  public async tryToStartDirection() {
    if (
      this.state.uiControllerState.status !== 'default' &&
      this.state.uiControllerState.directionFromPoint &&
      this.state.uiControllerState.directionToPoint
    ) {
      try {
        if (
          this.state.uiControllerState.directionFromPoint.objectClass ===
            'LatLngFloor' &&
          this.mapActionsDispatcher.hasIndoorLocation()
        ) {
          this.startNavigation()
        } else {
          let direction =
            this.state.uiControllerState.venue &&
            this.state.universeSelectorState.selectedUniverse &&
            this.state.uiControllerState.directionMode &&
            (await this.devCallbackInterceptor.onDirectionWillStart?.(
              this.state.uiControllerState.venue,
              this.state.universeSelectorState.selectedUniverse,
              this.state.uiControllerState.directionFromPoint,
              this.state.uiControllerState.directionToPoint,
              this.state.uiControllerState.directionMode,
              false
            ))
          if (direction === undefined) {
            direction = await this.apiService.getDirection({
              from: this.buildDirectionPoint(
                this.state.uiControllerState.directionFromPoint
              ),
              to: this.buildDirectionPoint(
                this.state.uiControllerState.directionToPoint
              ),
              mode: this.state.uiControllerState.directionMode,
            })
          }
          const nextState = produce(
            this.state,
            (draftState: WritableDraft<MapwizeUIState>) => {
              this.setNextDirectionStep(draftState)
              draftState.uiControllerState.direction = direction
              draftState.bottomViewState.directionContent = buildDirectionInfo(
                direction,
                this.state.uiControllerState.unit
              )
              draftState.bottomViewState.hidden = false
              draftState.bottomViewState.expanded = false
            }
          )
          const oldState = this.state
          this.state = nextState
          this.render(oldState, nextState)

          this.mapActionsDispatcher.unselectContent()
          this.startDirection(direction, new DirectionOptions())
        }
      } catch (e) {
        const nextState = produce(
          this.state,
          (draftState: WritableDraft<MapwizeUIState>) => {
            this.setNextDirectionStep(draftState)
            draftState.uiControllerState.direction = undefined
            draftState.bottomViewState.directionContent = buildDirectionError(
              this.state.uiControllerState.preferredLanguage
            )
            draftState.bottomViewState.hidden = false
            draftState.bottomViewState.expanded = false
          }
        )
        const oldState = this.state
        this.state = nextState
        this.render(oldState, nextState)
        this.mapActionsDispatcher.stopDirection()
      }
    }
  }
  private async directionObjectToMapwizeObject(
    directionPointWrapper: DirectionPointWrapper
  ): Promise<any> {
    if (directionPointWrapper.placeId) {
      const place = await this.apiService.getPlaceWithId(
        directionPointWrapper.placeId
      )
      return place
    } else {
      return Promise.resolve(directionPointWrapper)
    }
  }

  public async startDirectionFromProps(
    directionProp: DirectionProp | undefined
  ) {
    if (directionProp === undefined || directionProp.direction == undefined) {
      this.directionBackButtonClick()
      return
    }
    const direction = directionProp.direction
    const [from, to] = await Promise.all([
      this.directionObjectToMapwizeObject(direction.from),
      this.directionObjectToMapwizeObject(direction.to),
    ])
    const nextState = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchBarState.searchQuery = ''
        draftState.searchBarState.isHidden = true
        draftState.searchBarState.isInSearch = false
        draftState.searchResultListState.isHidden = true
        draftState.searchResultListState.results = undefined
        draftState.searchResultListState.universes = []
        draftState.searchResultListState.currentUniverse = undefined
        draftState.searchResultListState.showCurrentLocation = undefined
        draftState.searchDirectionBarState.isHidden = false
        draftState.universeSelectorState.isHidden = true
        draftState.languageSelectorState.isHidden = true
        draftState.searchResultListState.isInDirectionSearch = false
        draftState.searchContainerState.isInSearch = false

        draftState.uiControllerState.status = 'inDirection'
        if (to.objectClass === 'Place') {
          const details = await this.apiService.getPlaceDetailsWithId(to._id)
          draftState.bottomViewState.content = buildPlaceDetails(
            details,
            draftState.uiControllerState.preferredLanguage
          )
        }
        draftState.uiControllerState.status = 'inDirection'
        draftState.uiControllerState.direction = direction
        draftState.uiControllerState.directionFromPoint = from
        draftState.uiControllerState.directionToPoint = to
        draftState.uiControllerState.directionMode = direction.mode

        draftState.bottomViewState.directionContent = buildDirectionInfo(
          direction,
          draftState.uiControllerState.unit
        )
        draftState.searchDirectionBarState.fromQuery =
          from.objectClass === 'Place'
            ? titleForLanguage(
                from,
                draftState.uiControllerState.preferredLanguage
              )
            : lang_coordinates(draftState.uiControllerState.preferredLanguage)
        draftState.searchDirectionBarState.toQuery =
          to.objectClass === 'Place'
            ? titleForLanguage(
                to,
                draftState.uiControllerState.preferredLanguage
              )
            : lang_coordinates(draftState.uiControllerState.preferredLanguage)
        draftState.bottomViewState.hidden = false
        draftState.bottomViewState.expanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.mapActionsDispatcher.unselectContent()
    this.startDirection(direction, directionProp.directionOptions)
  }
  public async startNavigationFromProps(
    navigationProp: NavigationProp | undefined
  ) {
    if (
      navigationProp === undefined ||
      navigationProp.destination === undefined
    ) {
      this.directionBackButtonClick()
      return
    }
    const from = this.mapActionsDispatcher.getUserLocation()
    console.log('from', from)
    const to = navigationProp.destination
    const nextState = await produce(
      this.state,
      async (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.searchBarState.searchQuery = ''
        draftState.searchBarState.isHidden = true
        draftState.searchBarState.isInSearch = false
        draftState.searchResultListState.isHidden = true
        draftState.searchResultListState.results = undefined
        draftState.searchResultListState.universes = []
        draftState.searchResultListState.currentUniverse = undefined
        draftState.searchResultListState.showCurrentLocation = undefined
        draftState.searchDirectionBarState.isHidden = false
        draftState.universeSelectorState.isHidden = true
        draftState.languageSelectorState.isHidden = true
        draftState.searchResultListState.isInDirectionSearch = false
        draftState.searchContainerState.isInSearch = false

        draftState.uiControllerState.status = 'inDirection'
        const toObject: any = to
        if (toObject.objectClass === 'Place') {
          const details = await this.apiService.getPlaceDetailsWithId(
            toObject._id
          )
          draftState.bottomViewState.content = buildPlaceDetails(
            details,
            draftState.uiControllerState.preferredLanguage
          )
        }
        draftState.uiControllerState.status = 'inDirection'
        // draftState.uiControllerState.direction = direction;
        draftState.uiControllerState.directionToPoint = navigationProp.destination as any
        draftState.uiControllerState.directionMode =
          navigationProp.directionMode

        draftState.uiControllerState.directionFromPoint = from
        draftState.searchDirectionBarState.fromQuery = lang_current_location(
          this.state.uiControllerState.preferredLanguage
        )
        draftState.searchDirectionBarState.toQuery =
          toObject?.objectClass === 'Place'
            ? titleForLanguage(
                toObject,
                draftState.uiControllerState.preferredLanguage
              )
            : lang_coordinates(draftState.uiControllerState.preferredLanguage)
        draftState.bottomViewState.hidden = false
        draftState.bottomViewState.expanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)

    this.mapActionsDispatcher.unselectContent()
    this.startNavigation(navigationProp)
  }

  public startNavigation(navigationProp?: NavigationProp) {
    const navigationPropFull =
      navigationProp ||
      new NavigationProp(
        this.state.uiControllerState.directionToPoint,
        this.state.uiControllerState.directionMode,
        new DirectionOptions(),
        15
      )

    const userNavigation =
      this.state.uiControllerState.venue &&
      this.state.universeSelectorState.selectedUniverse &&
      this.devCallbackInterceptor.onNavigationRequested?.(
        this.state.uiControllerState.venue,
        this.state.universeSelectorState.selectedUniverse,
        navigationPropFull
      )
    this.mapActionsDispatcher.startNavigation(
      userNavigation !== undefined ? userNavigation : navigationPropFull
    )
  }
  public updateNavigationInfo(navigationInfo: NavigationInfo) {
    const nextState = produce(
      this.state,
      (draftState: WritableDraft<MapwizeUIState>) => {
        draftState.bottomViewState.directionContent = buildNavigationInfo(
          navigationInfo,
          this.state.uiControllerState.unit
        )
        draftState.bottomViewState.hidden = false
        draftState.bottomViewState.expanded = false
      }
    )
    const oldState = this.state
    this.state = nextState
    this.render(oldState, nextState)
  }

  public startDirection(direction: any, directionOptions: any) {
    let fromLabel = lang_start(this.state.uiControllerState.language)
    let toLabel = lang_destination(this.state.uiControllerState.language)
    if (
      this.state.uiControllerState.directionFromPoint?.objectClass ===
        'Place' ||
      this.state.uiControllerState.directionFromPoint?.objectClass ===
        'Placelist'
    ) {
      fromLabel = this.state.searchDirectionBarState.fromQuery
    }
    if (
      this.state.uiControllerState.directionToPoint?.objectClass === 'Place' ||
      this.state.uiControllerState.directionToPoint?.objectClass === 'Placelist'
    ) {
      toLabel = this.state.searchDirectionBarState.toQuery
    }
    this.mapActionsDispatcher.startDirection(
      direction,
      directionOptions,
      fromLabel,
      toLabel
    )
  }

  private buildDirectionPoint(point: any): any {
    return point
  }

  private defaultToSearch(draftState: WritableDraft<MapwizeUIState>) {
    draftState.searchContainerState.isInSearch = true
    draftState.searchBarState.isInSearch = true
    draftState.searchBarState.searchQuery = ''
    draftState.searchResultListState.isHidden = false
    draftState.searchResultListState.isInDirectionSearch = false
    draftState.bottomViewState.hidden = true
    draftState.uiControllerState.status = 'inSearch'
  }

  private searchToDefault(draftState: WritableDraft<MapwizeUIState>) {
    draftState.searchResultListState.isHidden = true
    draftState.searchResultListState.results = undefined
    draftState.searchResultListState.universes = []
    draftState.searchResultListState.currentUniverse = undefined
    draftState.searchResultListState.showCurrentLocation = undefined
    draftState.searchBarState.isInSearch = false
    draftState.searchBarState.searchQuery = ''
    draftState.searchContainerState.isInSearch = false
    draftState.uiControllerState.status = 'default'
  }

  private defaultToDirection(draftState: WritableDraft<MapwizeUIState>) {
    draftState.searchBarState.searchQuery = ''
    draftState.searchBarState.isHidden = true
    draftState.searchBarState.isInSearch = false
    draftState.searchResultListState.isHidden = false
    draftState.searchResultListState.results = undefined
    draftState.searchResultListState.universes = []
    draftState.searchResultListState.currentUniverse = undefined
    draftState.searchResultListState.showCurrentLocation = undefined
    draftState.searchDirectionBarState.isHidden = false
    // draftState.searchDirectionBarState.isFromFocus = true
    draftState.universeSelectorState.isHidden = true
    draftState.languageSelectorState.isHidden = true
    // draftState.uiControllerState.status = 'inFromSearch'
    if (this.mapActionsDispatcher.hasIndoorLocation()) {
      draftState.searchDirectionBarState.fromQuery = lang_current_location(
        this.state.uiControllerState.preferredLanguage
      )
      draftState.uiControllerState.directionFromPoint = this.mapActionsDispatcher.getUserLocation()
    }
    if (this.state.uiControllerState.selectedContent) {
      const title = titleForLanguage(
        draftState.uiControllerState.selectedContent,
        draftState.uiControllerState.language
      )
      title && (draftState.searchDirectionBarState.toQuery = title)
      draftState.uiControllerState.directionToPoint =
        draftState.uiControllerState.selectedContent
      // draftState.bottomViewState.hidden = true
      // this.mapActionsDispatcher.unselectContent()
    }
    this.setNextDirectionStep(draftState)
  }

  private directionToDefault(draftState: WritableDraft<MapwizeUIState>) {
    draftState.uiControllerState.status = 'default'
    draftState.searchBarState.isHidden = false
    draftState.searchBarState.isInSearch = false
    draftState.searchResultListState.isHidden = true
    draftState.searchResultListState.results = undefined
    draftState.searchResultListState.universes = []
    draftState.searchResultListState.currentUniverse = undefined
    draftState.searchResultListState.showCurrentLocation = undefined
    draftState.searchDirectionBarState.isHidden = true
    draftState.searchDirectionBarState.fromQuery = ''
    draftState.searchDirectionBarState.toQuery = ''
    draftState.searchContainerState.isInSearch = false
    draftState.uiControllerState.directionFromPoint = undefined
    draftState.uiControllerState.directionToPoint = undefined
    draftState.uiControllerState.direction = undefined
    if (this.state.uiControllerState.selectedContent) {
      draftState.bottomViewState.hidden = false
      draftState.languageSelectorState.isHidden = true
      draftState.universeSelectorState.isHidden = true
      if (
        this.state.uiControllerState.selectedContent.objectClass === 'Place'
      ) {
        this.mapActionsDispatcher.selectPlace(
          this.state.uiControllerState.selectedContent as any,
          false
        )
      }
      if (
        this.state.uiControllerState.selectedContent.objectClass === 'Placelist'
      ) {
        this.mapActionsDispatcher.selectPlacelist(
          this.state.uiControllerState.selectedContent as any
        )
      }
    } else {
      draftState.universeSelectorState.isHidden = false
      draftState.languageSelectorState.isHidden = false
      draftState.bottomViewState.hidden = true
    }
    draftState.bottomViewState.directionContent = undefined
    setTimeout(() => this.mapActionsDispatcher.stopDirection(), 300)
  }

  private directionToExitVenue(draftState: WritableDraft<MapwizeUIState>) {
    draftState.searchBarState.isHidden = false
    draftState.searchBarState.isInSearch = false
    draftState.searchResultListState.isHidden = true
    draftState.searchResultListState.results = undefined
    draftState.searchResultListState.universes = []
    draftState.searchResultListState.currentUniverse = undefined
    draftState.searchResultListState.showCurrentLocation = undefined
    draftState.searchDirectionBarState.isHidden = true
    draftState.searchContainerState.isInSearch = false
    draftState.bottomViewState.hidden = true
  }

  private enterVenueInDirection(draftState: WritableDraft<MapwizeUIState>) {
    draftState.searchBarState.isHidden = true
    draftState.searchBarState.isInSearch = true
    draftState.searchDirectionBarState.isHidden = false
    draftState.searchContainerState.isInSearch = false
    draftState.bottomViewState.hidden = false
    setTimeout(
      () =>
        this.startDirection(
          this.state.uiControllerState.direction,
          new DirectionOptions()
            .setCenterOnStart(!this.state.uiControllerState.lastExitedVenue)
            .setDisplayStartingFloor(false)
        ),
      100
    )
  }

  private selectedContentToExitVenue(
    draftState: WritableDraft<MapwizeUIState>
  ) {
    draftState.bottomViewState.hidden = true
    draftState.mapwizeMapState.selectedPlace = undefined
  }

  private enterVenueInSelectedContent(
    draftState: WritableDraft<MapwizeUIState>
  ) {
    draftState.bottomViewState.hidden = false
  }
}
/*eslint-enable */
