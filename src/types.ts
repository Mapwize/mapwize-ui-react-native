import type {
  MapwizeViewProps,
  PlaceDetails,
  Translation,
  Floor as FloorSDK,
} from 'mapwize-sdk-react-native'
import type { DevCallbackInterceptor } from './devCallbackInterceptor'

//TODO point to mapwize react sdk types instead

export enum Channel {
  MAP_CLICK = 1,
  SEARCH,
  MAIN_SEARCHES,
}
export interface Floor extends FloorSDK {
  number: number
  translations: Translation[]
}

/**
 * This is PlaceDetails with translated attributes
 */
export interface FormattedPlaceDetails extends PlaceDetails {
  titleLabel?: string
  subtitleLabel?: string
  detailsLabel?: string
}

export interface SearchResult {
  _id: string
  title: string
  subtitle: string
  floor?: number
  floorLabel?: string
  cache: { '30': string }
  objectClass: 'Place' | 'Venue' | 'Placelist'
}

export interface OpeningHoursRow {
  day: string
  intervals: string
}

export interface ButtonContent {
  id: string
  title: string
  imageSrc: any
  highlighted: boolean
  callback: (object?: any) => void
}

export interface RowsContent {
  id: string
  title: string
  imageSrc: any
  available: boolean
  data?: any
  callback?: (object?: any) => void
}

export interface UIOptions extends MapwizeViewProps, DevCallbackInterceptor {
  /**
   * The mainColor allows you to change the default Mapwize color in the entire UI
   * Default is '#C51586'
   */
  mainColor?: string
  /**
   * The preferredLanguage is used to display the UserInterface.
   * It is also use as default language when entering in a Venue if this language is available
   * Default is the phone current language
   */
  preferredLanguage?: string
  /**
   * The unit used to display distance
   * Default is the phone current metric system
   */
  unit?: string
  /**
   * Display the hour in a 24 format or not
   */
  uses24?: boolean
  /**
   *
   * Whether to show the Menu Button or not
   */
  menuButtonHidden?: boolean
  /**
   *
   * Whether to show the Follow User Button or not
   */
  followUserButtonHidden?: boolean
  /**
   *
   * Whether to show the Floor Controller or not
   */
  floorControllerHidden?: boolean
}
// mainColor sur la map.
// Direction Options pictos

// Les callbacks.
