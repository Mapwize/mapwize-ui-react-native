import React, { useState } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { DevCallbackInterceptor } from '../../../devCallbackInterceptor'
import { buildCurrentOpeningStatus } from '../../../formatter/openingHoursFormatter'
import icons from '../../../icons'
import {
  lang_call,
  lang_capacity_not_available,
  lang_currently_available,
  lang_currently_occupied,
  lang_details,
  lang_direction,
  lang_information,
  lang_on_floor,
  lang_opening_hours_not_available,
  lang_outdoor,
  lang_overview,
  lang_phone_not_available,
  lang_schedule_not_available,
  lang_share,
  lang_website,
  lang_website_not_available,
} from '../../../localizor'
import {
  ButtonContent,
  FormattedPlaceDetails,
  OpeningHoursRow,
  RowsContent,
} from '../../../types'
import CalendarEvents from './calendarEvents'

export interface ExpandedPlaceDetailsState {
  placeDetails: FormattedPlaceDetails
  buttonsContent: ButtonContent[]
  rowsContent: RowsContent[]
  openingStatus: string
  language: string
  mainColor?: string
}

export interface ExpandedPlaceDetailsProps {
  style: any
  reduxState: ExpandedPlaceDetailsState
  callbackInterceptor: DevCallbackInterceptor
  onExpandClick: () => void
  onCloseClick: () => void
}

const getCalendarEventsView = (
  row?: RowsContent,
  index?: number,
  mainColor?: string
) => {
  return (
    <View key={index}>
      {getRowView(row, mainColor, true)}
      <ScrollView horizontal>
        <CalendarEvents data={row?.data} mainColor={mainColor} />
      </ScrollView>
      <View style={styles.separator} />
    </View>
  )
}

const getOpeningHoursView = (
  row?: RowsContent,
  index?: number,
  mainColor?: string
) => {
  const [expanded, setExpanded] = useState<boolean>(false)
  return (
    <View key={index}>
      {getRowView(row, mainColor, true, expanded, () => setExpanded(!expanded))}
      {expanded &&
        row?.data?.map((dayRow: OpeningHoursRow, dayIndex: number) => {
          return (
            <View key={dayIndex} style={styles.openingHoursRow}>
              <Text style={styles.openingHoursRowDay}>{dayRow.day}</Text>
              <Text style={styles.openingHoursRowInterval}>
                {dayRow.intervals}
              </Text>
            </View>
          )
        })}
      <View style={styles.separator} />
    </View>
  )
}

const getSimpleRowView = (
  row?: RowsContent,
  index?: number,
  mainColor?: string
) => {
  return (
    <View key={index}>
      <TouchableWithoutFeedback onPress={row?.callback}>
        {getRowView(row, mainColor)}
      </TouchableWithoutFeedback>
      <View style={styles.separator} />
    </View>
  )
}

const getRowView = (
  row?: RowsContent,
  mainColor?: string,
  withArrow?: boolean,
  expanded?: boolean,
  onExpand?: () => void
) => {
  return (
    <View style={[styles.row]}>
      <Image
        style={[styles.rowIcon, row?.available && { tintColor: mainColor }]}
        source={row?.imageSrc}
      />
      <Text
        style={[styles.rowText, !row?.available && styles.rowTextNotAvailable]}
      >
        {row?.title}
      </Text>
      {withArrow && (
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={onExpand}
        >
          <Image
            style={[
              styles.rowIcon,
              styles.arrowIcon,
              row?.available && { tintColor: mainColor },
            ]}
            source={expanded ? icons.ARROW_UP : icons.ARROW_DOWN}
          />
        </TouchableHighlight>
      )}
    </View>
  )
}

const ExpandedPlaceDetailsUI = ({
  style,
  reduxState: {
    placeDetails, // : any;
    buttonsContent,
    rowsContent,
    openingStatus,
    language, // : string;
    mainColor, // : string;
  },
  onExpandClick,
  onCloseClick,
  callbackInterceptor, // : DevCallbackInterceptor;
}: ExpandedPlaceDetailsProps) => {
  const [overview, setOverview] = useState(true)
  return (
    <>
      <SafeAreaView
        style={[styles.placeDetails]}
        edges={['right', 'bottom', 'left']}
      >
        <TouchableHighlight
          style={[styles.backButton]}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={onCloseClick}
        >
          <Image style={[styles.backButtonImage]} source={icons.LEFT_CHEVRON} />
        </TouchableHighlight>
        <ScrollView
          horizontal={true}
          style={{ maxHeight: 200, minHeight: 200 }}
        >
          <View style={styles.scrollInnerView}>
            {placeDetails?.photos?.map((photo: string, index: number) => (
              <View key={index} style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: photo }} />
                <View style={styles.imageSeparator} />
              </View>
            ))}
            {(!placeDetails?.photos || placeDetails?.photos?.length == 0) && (
              <View style={styles.imageContainer}>
                <Image style={styles.image} source={icons.PLACE_HOLDER} />
                <View style={styles.imageSeparator} />
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.drag} />
        <TouchableWithoutFeedback onPress={() => onExpandClick()}>
          <Text style={[styles.titleLabel]}>{placeDetails?.titleLabel}</Text>
        </TouchableWithoutFeedback>
        {placeDetails?.subtitleLabel != null &&
          placeDetails?.subtitleLabel !== '' && (
            <Text style={[styles.subtitleLabel]}>
              {placeDetails?.subtitleLabel}
            </Text>
          )}
        {placeDetails.detailsLabel !== undefined &&
          placeDetails.detailsLabel !== '' && (
            <View style={styles.pagerHeader}>
              <TouchableHighlight
                style={styles.pagerTouchable}
                activeOpacity={0.6}
                underlayColor="#DDDDDD"
                onPress={() => setOverview(true)}
              >
                <View>
                  <Text
                    style={[
                      styles.pagerText,
                      overview && {
                        color: mainColor,
                      },
                    ]}
                  >
                    {lang_overview(language)}
                  </Text>
                  <View
                    style={[
                      styles.pagerSeparator,
                      overview && { backgroundColor: mainColor },
                    ]}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.pagerColumn]}
                activeOpacity={0.6}
                underlayColor="#DDDDDD"
                onPress={() => setOverview(false)}
              >
                <View>
                  <Text
                    style={[
                      styles.pagerText,
                      !overview && {
                        color: mainColor,
                      },
                    ]}
                  >
                    {lang_details(language)}
                  </Text>
                  <View
                    style={[
                      styles.pagerSeparator,
                      !overview && { backgroundColor: mainColor },
                    ]}
                  />
                </View>
              </TouchableHighlight>
            </View>
          )}
        <View
          style={[
            styles.separator,
            placeDetails.detailsLabel !== undefined &&
              placeDetails.detailsLabel !== '' && { marginTop: 0 },
          ]}
        />
        {placeDetails.detailsLabel !== undefined && !overview && (
          <View style={[styles.webviewContainer]}>
            <WebView
              originWhitelist={['*']}
              source={{
                html: placeDetails.detailsLabel,
              }}
            />
          </View>
        )}
        {overview && (
          <ScrollView>
            <View>
              <ScrollView
                style={styles.buttonsScrollView}
                horizontal={true}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.buttonsScrollInnerView}
              >
                {buttonsContent?.map((button, index) => {
                  return (
                    <TouchableHighlight
                      key={index}
                      style={[styles.buttonContainer]}
                      activeOpacity={0.6}
                      underlayColor="#DDDDDD"
                      onPress={() => button.callback()}
                    >
                      <>
                        <View
                          style={[
                            styles.buttonIcon,
                            { borderColor: mainColor },
                            button.highlighted && {
                              backgroundColor: mainColor,
                            },
                          ]}
                        >
                          <Image
                            style={[
                              styles.icon,
                              !button.highlighted && { tintColor: mainColor },
                            ]}
                            source={button.imageSrc}
                          />
                        </View>
                        <Text style={[styles.buttonText, { color: mainColor }]}>
                          {button.title}
                        </Text>
                      </>
                    </TouchableHighlight>
                  )
                })}
              </ScrollView>
              <View style={styles.separator} />
              {rowsContent?.map((row, index) => {
                if (
                  row.id === 'mwz-openingHours-row' &&
                  row.available &&
                  row.data
                ) {
                  return getOpeningHoursView(row, index, mainColor)
                }
                if (
                  row.id === 'mwz-calendarEvents-row' &&
                  row.available &&
                  row.data
                ) {
                  return getCalendarEventsView(row, index, mainColor)
                }
                return getSimpleRowView(row, index, mainColor)
              })}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  placeDetails: {
    height: '100%',
    width: '100%',
    elevation: 16,
    zIndex: 16,
    paddingBottom: 16,
    overflow: 'hidden',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  separator: {
    backgroundColor: 'lightgray',
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  drag: {
    display: 'none',
    width: 50,
    height: 8,
    backgroundColor: 'lightgray',
    alignSelf: 'center',
    margin: 4,
    borderRadius: 16,
  },
  titleLabel: {
    fontSize: 22,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  subtitleLabel: {
    fontSize: 16,
    paddingHorizontal: 16,
    marginTop: 4,
    color: 'gray',
  },
  buttonContainer: {
    minWidth: 70,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  highlighted: {
    backgroundColor: 'white',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    paddingHorizontal: 8,
  },
  buttonsScrollView: {},
  buttonsScrollInnerView: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  scrollInnerView: {
    flexDirection: 'row',
  },
  imageContainer: { flexDirection: 'row' },
  image: {
    height: 200,
    width: Dimensions.get('window').width,
  },
  imageSeparator: { width: 2, backgroundColor: 'white' },
  icon: {
    width: 16,
    height: 16,
    tintColor: 'white',
  },
  buttonIcon: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 32,
    height: 40,
    width: 40,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: {
    marginHorizontal: 16,
    width: 20,
    height: 20,
    tintColor: 'lightgray',
  },
  arrowIcon: {},
  rowText: {
    flexWrap: 'wrap',
    overflow: 'hidden',
    flex: 1,
    paddingHorizontal: 8,
  },
  rowTextNotAvailable: {
    fontStyle: 'italic',
    color: 'gray',
  },
  openingHoursRow: {
    flexDirection: 'row',
    paddingStart: 60,
    paddingEnd: 32,
    justifyContent: 'space-between',
  },
  openingHoursRowDay: {
    marginEnd: 16,
    marginTop: 8,
  },
  openingHoursRowInterval: {
    marginEnd: 16,
    marginTop: 8,
  },
  safeAreaView: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
    elevation: 2,
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 32,
    opacity: 0.7,
    justifyContent: 'center',
  },
  backButtonImage: {},
  pagerText: {
    fontSize: 18,
    paddingVertical: 12,
    height: 48,
    textAlign: 'center',
    color: 'gray',
  },
  pagerSeparator: { height: 4 },
  pagerColumn: { flexDirection: 'column', flexGrow: 1 },
  webviewContainer: { flexGrow: 1 },
  pagerHeader: {
    flexDirection: 'row',
    alignContent: 'space-between',
    marginTop: 16,
  },
  pagerTouchable: { flexDirection: 'column', flexGrow: 1 },
})

export default ExpandedPlaceDetailsUI
