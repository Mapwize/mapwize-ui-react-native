# Mapwize UI for React Native

This library provides developers with a fully featured and ready to use UI to add Mapwize Indoor Maps and Navigation in their React Native mobile application.

## Integration

MapwizeUI has the following PeerDependencies, you have to include them in order to get MapwizeUI working

```json
    "mapwize-sdk-react-native": "^1.1.2",
    "react-native-webview": "^11.2.4",
    "react-native-safe-area-context": "^3.2.0",
    "react-native-localize": "^2.0.2",
    "react-native-canvas": "^0.1.37",
```

You can install everything by running the following command

`yarn add mapwize-sdk-react-native mapwize-ui-react-native react-native-webview react-native-safe-area-context react-native-localize react-native-canvas`

### iOS

The minimum supported iOS version is 10.0.
The minimum supported `MapwizeSDK` version is ` 3.4.5`.

- MapwizeSDK requires that you add `use_frameworks!` in your Podfile.

- Run `pod install` in your `ios` directory

- Add the `MGLMapboxMetricsEnabledSettingShownInApp` key in your info.plist and set it to `YES`

### Android

The minimum supported Android sdk version is 21.
The minimum supported `mapwize-sdk-android` version is `3.6.4`.

in your Project `build.gradle` file, you have to add :

```groovy
allprojects {
    repositories {
        ...
        maven { url 'https://www.jitpack.io' }
        maven { url 'https://maven.mapwize.io'}
    }
}
```

## The UI API

The map UI implements a `UIOptions` interface, this interface provides the same props as the SDK `MapwizeMap`, adds the `DevCallbackInterceptor` and implements the following properties:

```ts
interface UIOptions extends MapwizeViewProps, DevCallbackInterceptor {
  /**
   * The mainColor allows you to change the default Mapwize color in the entire UI
   * Default is '#C51586'
   */
  mainColor?: string
  /**
   * The preferredLanguage is used to display the UserInterface.
   * It is also use as default language when entering in a Venue if this language is available
   * Default is the mobile current language
   */
  preferredLanguage?: string
  /**
   * The unit used to display distance
   * Default is the phone current metric system
   */
  unit?: string
  /**
   * Display the hour in a 24 format or not
   * Default is the mobile current hour format
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
```

If you need more customization, you can use the properties provided by the `DevCallbackInterceptor`.

```ts
interface DevCallbackInterceptor {
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
   * Called before displaying the details view. You can use this method to change the content of the details view on the fly.
   */
  onPlaceSelected?: (
    placeDetails: FormattedPlaceDetails,
    rowsContents: RowsContent[],
    buttonsContents: ButtonContent[]
  ) => void
}
```

## Mapwize API Key

You'll need a Mapwize API key to load the Map and allow API requests.

To get your own Mapwize API key, sign up for a free account at [mapwize.io](https://www.mapwize.io). Then within the [Mapwize Studio](https://studio.mapwize.io), navigate to "API Keys" on the side menu.

## Using the UI

You can find a ready to use example in the `example` folder in this repository.

The `MapwizeUI` component requires at least a MapwizeConfiguration props. The MapwizeConfiguration contains your Mapwize Api key that will be used to display data on the map.

```jsx
const mapConfig = new MapwizeConfiguration('YOUR_API_KEY');
render() {
    return <MapwizeUI
        style={{flex: 1}}
        mapwizeConfiguration={mapConfig}/>
}

```

All instantiated maps are independent. You can add multiple maps with different `MapwizeConfiguration` in your application.

## Using the map methods

You can use the `MapwizeViewRef` returned by the `onUiReady` property to run any map related method.

```jsx
const mapConfig = new MapwizeConfiguration('YOUR_API_KEY');
render() {
    return <MapwizeUI
        style={{flex: 1}}
        mapwizeConfiguration={mapConfig}
        onUiReady={(mapwizeMap: MapwizeViewRef) => mapwizeMap.setFloor(3)}
      />
}
```

## Documentation

Please refer to the Mapwize SDK React Native documentation on [docs.mapwize.io](https://docs.mapwize.io/)

## Contributing

While this project is mainly maintained by the Mapwize team, all contributions are welcome. Do not hesitate to open an issue or create a pull request on this project.

## Evolution and support

For any question or request, please contact us at <support@mapwize.io>.

## License

MIT
