import {
  Direction,
  DirectionMode,
  DirectionPoint,
  MapwizeObject,
  MapwizeViewRef,
  NavigationProp,
  Universe,
  Venue,
} from 'mapwize-sdk-react-native'
import { ButtonContent, FormattedPlaceDetails, RowsContent } from './types'

export interface DevCallbackInterceptor {
  /**
   * Called after the map and the ui are ready
   */
  onUiReady?: (mapwizeViewRef: MapwizeViewRef) => void
  /**
   * Called before querying the API. You can return a Direction object that will be displayed on the map
   */
  onDirectionWillStart?: (
    venue: Venue,
    universe: Universe,
    from: DirectionPoint,
    to: DirectionPoint,
    mode: DirectionMode,
    isNavigation: boolean
  ) => Promise<Direction | undefined>
  /**
   * Called before setting navigation on the map. You can return a NavigationProp object that will be displayed on the map
   */
  onNavigationRequested?: (
    venue: Venue,
    universe: Universe,
    navigationProp: NavigationProp
  ) => NavigationProp | undefined
  /**
   * Called before selecting a place or a placelist. You can decide if you want to show the information button in the selected content view
   */
  shouldDisplayInformationButton?: (
    placeDetails: FormattedPlaceDetails
  ) => boolean
  /**
   * Called when the user clicks on the information button.
   */
  onInformationButtonClick?: (mapwizeObject: MapwizeObject) => void
  /**
   * Called when the user clicks on the menu button
   */
  onMenuButtonClick?: () => void
  /**
   * Called when the user clicks on the Location Control without having a Location
   */
  onFollowUserButtonClickWithoutLocation?: () => void
  /**
   * Called before displaying the details view. You can use this method to change the content of the view on the fly.
   */
  onPlaceSelected?: (
    placeDetails: FormattedPlaceDetails,
    rowsContents: RowsContent[],
    buttonsContents: ButtonContent[]
  ) => void
}

const defaultCallbackInterceptor: DevCallbackInterceptor = {
  onUiReady: (mapwizeViewRef: MapwizeViewRef) => {
    console.log('onUiReady')
  },
  onDirectionWillStart: (
    venue: Venue,
    universe: Universe,
    from: DirectionPoint,
    to: DirectionPoint,
    mode: DirectionMode,
    isNavigation: boolean
  ) => {
    console.log(
      'onDirectionWillStart'
      // venue,
      // universe,
      // from,
      // to,
      // mode,
    )
    return Promise.resolve(undefined)
  },
  onNavigationRequested: (
    venue: Venue,
    universe: Universe,
    navigationProp: NavigationProp
  ) => {
    console.log(
      'onNavigationRequested'
      // venue,
      // universe,
      // navigationProp,
    )
    return undefined
  },
  shouldDisplayInformationButton: (placeDetails: FormattedPlaceDetails) => {
    // console.log('shouldDisplayInformationButton'); //, placeDetails);
    return true
  },
  onInformationButtonClick: (mapwizeObject: MapwizeObject) => {
    console.log('onInformationButtonClick') //, mapwizeObject);
  },
  onMenuButtonClick: () => console.log('onMenuButtonClick'),
  onFollowUserButtonClickWithoutLocation: () =>
    console.log('onFollowUserButtonClickWithoutLocation'),
  /**
   * Called before displaying the details view. You can use this method to change the content of the view on the fly.
   */
  onPlaceSelected: (
    placeDetails: FormattedPlaceDetails,
    rowsContents: RowsContent[],
    buttonsContents: ButtonContent[]
  ) => {
    console.log('onPlaceSelected') //, placeDetails, rowsContents, buttonsContents);
  },
}

export const buildCallbackInterceptor = (
  callbackInterceptor?: DevCallbackInterceptor
): DevCallbackInterceptor => {
  return {
    ...defaultCallbackInterceptor,
    ...callbackInterceptor,
  }
}
