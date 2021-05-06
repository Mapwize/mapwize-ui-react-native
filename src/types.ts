import type {
  MapwizeViewProps,
  PlaceDetails,
  Translation,
  Floor as FloorSDK,
} from 'mapwize-sdk-react-native'
import type { DevCallbackInterceptor } from './devCallbackInterceptor'

// export enum Channel {
//   MAP_CLICK = 1,
//   SEARCH,
//   MAIN_SEARCHES,
// }

/**
 * This adds the translations to the SDK Floor object
 */
export interface Floor extends FloorSDK {
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
  icon?: string
}

export interface OpeningHoursRow {
  day: string
  intervals: string
}

/**
 * The ButtonContent holds the button attributes so you can customize buttons on the fly
 */
export interface ButtonContent {
  /**
   * The id field can be used to update a specific button
   * Here is the list of ids that are currently used
   * [`mwz-directions-button`, `mwz-information-button`, `mwz-phone-button`, `mwz-website-button`, `mwz-share-button`]
   */
  id: string
  title: string
  /**
   * The icon of the button, it is fed to an `Image` React Native component
   */
  imageSrc: any
  /**
   * Whether to use a background with the mainColor or not
   */
  highlighted: boolean
  callback: (object?: any) => void
}

/**
 * The RowsContent holds the row attributes so you can customize buttons on the fly
 */
export interface RowsContent {
  /**
   * The id field can be used to update a specific row
   * Here is the list of ids that are currently used
   * [`mwz-floor-row`, `mwz-website-row`, `mwz-phone-row`, `mwz-capacity-row`, `mwz-openingHours-row`, `mwz-calendarEvents-row`]
   */
  id: string
  title: string
  /**
   * The icon of the row, it is fed to an `Image` React Native component
   */
  imageSrc: any
  /**
   * Whether to information or an italic gray colored text
   */
  available: boolean
  /**
   * This field is used to carry the data of the rows with these ids: `mwz-openingHours-row` or `mwz-calendarEvents-row`
   */
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
   * Display the hour in a 24 hour format or not
   * Default is true if the phone uses 24 hour format
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
