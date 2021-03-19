import React from 'react'
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
import type { DevCallbackInterceptor } from '../../../devCallbackInterceptor'

import type { ButtonContent, FormattedPlaceDetails } from '../../../types'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface SmallPlaceDetailsState {
  placeDetails: FormattedPlaceDetails
  buttonsContent: ButtonContent[]
  openingStatus: string
  calendarStatus: string
  language: string
  mainColor?: string
}

export interface SmallPlaceDetailsProps {
  style: any
  reduxState: SmallPlaceDetailsState
  callbackInterceptor: DevCallbackInterceptor
  onExpandClick: () => void
}

const SmallPlaceDetailsUI = ({
  style,
  reduxState: {
    placeDetails, // : any;
    buttonsContent,
    openingStatus,
    calendarStatus,
    language, // : string;
    mainColor, // : string;
  },
  onExpandClick,
  callbackInterceptor, // : DevCallbackInterceptor;
}: SmallPlaceDetailsProps) => {
  return (
    <>
      <SafeAreaView
        style={[style, styles.placeDetails]}
        edges={['right', 'bottom', 'left']}
      >
        {placeDetails?.photos?.length > 0 && (
          <ScrollView horizontal={true}>
            <View style={styles.scrollInnerView}>
              {placeDetails?.photos?.map((photo: string, index: number) => (
                <View key={index} style={styles.imageContainer}>
                  <Image style={styles.image} source={{ uri: photo }} />
                  <View style={styles.imageSeparator} />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        <View style={styles.drag} />
        <TouchableWithoutFeedback onPress={() => onExpandClick()}>
          <Text style={[styles.titleLabel]}>{placeDetails?.titleLabel}</Text>
        </TouchableWithoutFeedback>
        {placeDetails.subtitleLabel !== undefined &&
          placeDetails.subtitleLabel !== '' && (
            <Text style={[styles.subtitleLabel]}>
              {placeDetails?.subtitleLabel}
            </Text>
          )}
        {placeDetails.openingHours && placeDetails.openingHours?.length > 0 && (
          <Text style={[styles.subtitleLabel]}>{openingStatus}</Text>
        )}
        {calendarStatus !== undefined && (
          <Text style={[styles.subtitleLabel]}>{calendarStatus}</Text>
        )}
        <ScrollView horizontal={true} style={styles.buttonScrollView}>
          <View style={styles.buttonsScrollInnerView}>
            {buttonsContent?.map((button, index) => {
              return (
                <TouchableHighlight
                  key={index}
                  style={[
                    styles.buttonContainer,
                    { borderColor: mainColor },
                    button.highlighted && { backgroundColor: mainColor },
                    !button.highlighted && styles.highlighted,
                  ]}
                  activeOpacity={0.6}
                  underlayColor={
                    (button.highlighted && mainColor + 'aa') || '#DDDDDD'
                  }
                  onPress={() => button.callback()}
                >
                  <>
                    <Image
                      style={[
                        styles.icon,
                        !button.highlighted && { tintColor: mainColor },
                      ]}
                      source={button.imageSrc}
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        !button.highlighted && { color: 'black' },
                      ]}
                    >
                      {button.title}
                    </Text>
                  </>
                </TouchableHighlight>
              )
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  placeDetails: {
    elevation: 8,
    paddingTop: 0,
    zIndex: 8,
    paddingBottom: 8,
    overflow: 'hidden',
    flexDirection: 'column',
    backgroundColor: 'white',
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
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  subtitleLabel: {
    fontSize: 16,
    paddingHorizontal: 16,
    marginTop: 4,
    color: 'gray',
  },
  buttonContainer: {
    elevation: 2,
    height: 36,
    marginEnd: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
  },
  highlighted: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  buttonScrollView: {
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    paddingHorizontal: 8,
  },
  buttonsScrollInnerView: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  scrollInnerView: {
    flexDirection: 'row',
  },
  imageContainer: { flexDirection: 'row' },
  image: {
    height: 100,
    width: Dimensions.get('window').width,
  },
  imageSeparator: { width: 2, backgroundColor: 'white' },
})

export default SmallPlaceDetailsUI
