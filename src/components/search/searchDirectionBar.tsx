import { DirectionMode } from 'mapwize-sdk-react-native'
import React, { useEffect, useRef } from 'react'
import {
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '../../icons'

export interface SearchDirectionBarState {
  fromPlaceholder: string
  toPlaceholder: string
  fromQuery: string
  toQuery: string
  modes: DirectionMode[]
  selectedMode?: DirectionMode
  isHidden: boolean
  isInSearch: boolean
  isFromFocus: boolean
  isToFocus: boolean
  mainColor?: string
}

export interface SearchDirectionBarProps {
  style: any
  reduxState: SearchDirectionBarState
  onSelectedModeChange: (mode: DirectionMode) => void
  onFromQueryChange: (query: string) => void
  onToQueryChange: (query: string) => void
  onSwapButtonClick: () => void
  onBackButtonClick: () => void
  onFromFocus: () => void
  onFromBlur: () => void
  onToFocus: () => void
  onToBlur: () => void
}

const SearchDirectionBar = ({
  style,
  reduxState: {
    fromPlaceholder, //: string;
    toPlaceholder, //: string;
    fromQuery, //: string;
    toQuery, //: string;
    modes, //: DirectionMode[];
    selectedMode, //: DirectionMode;
    isHidden, //: boolean;
    isInSearch, //: boolean;
    isFromFocus, //: boolean;
    isToFocus, //: boolean;
    mainColor, //?: string;
  },
  onSelectedModeChange, //: (mode: DirectionMode) => void;
  onFromQueryChange, //: (query: string) => void;
  onToQueryChange, //: (query: string) => void;
  onSwapButtonClick, //: () => void;
  onBackButtonClick, //: () => void;
  onFromFocus, //: () => void;
  onFromBlur, //: () => void;
  onToFocus, //: () => void;
  onToBlur, //: () => void;
}: SearchDirectionBarProps) => {
  const from_input: React.RefObject<TextInput | null | undefined> = useRef()
  const to_input: React.RefObject<TextInput | null | undefined> = useRef()
  useEffect(() => {
    isFromFocus && from_input?.current?.focus()
    isToFocus && to_input?.current?.focus()
  }, [isFromFocus, isToFocus])
  return (
    <>
      <SafeAreaView
        style={[
          style,
          styles.searchDirectionBar,
          isInSearch && styles.isInSearch,
          isHidden && styles.isHidden,
        ]}
        edges={['top']}
      >
        <View style={[styles.innerSearchDirectionBar]}>
          <TouchableHighlight
            underlayColor={mainColor + '22'}
            style={[styles.backButton]}
            //TODO add accessibility label// accessibilityLabel={backTooltipMessage}
            onPress={() => {
              Keyboard.dismiss()
              onBackButtonClick()
            }}
          >
            <Image source={icons.LEFT_CHEVRON} />
          </TouchableHighlight>
          <View style={[styles.textInputRowsContainer]}>
            <View style={[styles.textInputContainer, { marginBottom: 8 }]}>
              <Image style={styles.icon} source={icons.DIRECTION_START} />
              <View
                style={[
                  styles.textInputPadding,
                  isFromFocus && { borderColor: mainColor },
                ]}
              >
                <TextInput
                  style={[styles.textInput]}
                  ref={from_input}
                  placeholder={fromPlaceholder}
                  showSoftInputOnFocus={true}
                  onFocus={() => !isFromFocus && onFromFocus()}
                  onBlur={() => onFromBlur()}
                  onChangeText={(text: string) => onFromQueryChange(text)}
                  value={fromQuery}
                  // focus={isFromFocus}
                />
              </View>
            </View>
            <View style={[styles.textInputContainer]}>
              <Image style={styles.icon} source={icons.DIRECTION_END} />
              <View
                style={[
                  styles.textInputPadding,
                  isToFocus && { borderColor: mainColor },
                ]}
              >
                <TextInput
                  style={[styles.textInput]}
                  ref={to_input}
                  placeholder={toPlaceholder}
                  showSoftInputOnFocus={true}
                  onFocus={() => !isToFocus && onToFocus()}
                  onBlur={() => onToBlur()}
                  onChangeText={(text: string) => onToQueryChange(text)}
                  value={toQuery}
                />
              </View>
            </View>
          </View>
          <TouchableHighlight
            style={[styles.swapButton]}
            underlayColor={mainColor + '22'}
            //TODO add accessibility label accessibilityLabel={backTooltipMessage}
            onPress={() => onSwapButtonClick()}
          >
            <Image source={icons.SWAP} />
          </TouchableHighlight>
        </View>
        <View style={[styles.modesContainer]}>
          {modes.map((mode: DirectionMode, index: number) => (
            <TouchableHighlight
              underlayColor={mainColor + '50'}
              style={[
                styles.icon,
                styles.modeItem,
                selectedMode?._id === mode._id && styles.selectedMode,
                selectedMode?._id === mode._id && {
                  borderColor: mainColor,
                  backgroundColor: mainColor + '22',
                },
              ]}
              key={index}
              onPress={() => onSelectedModeChange(mode)}
            >
              <Image
                style={[styles.modeIcon, { tintColor: mainColor }]}
                source={icons[mode.type]}
              />
            </TouchableHighlight>
          ))}
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  searchDirectionBar: {
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingTop: 8,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 8,
  },
  innerSearchDirectionBar: {
    flexDirection: 'row',
  },
  textInputRowsContainer: {
    flexDirection: 'column',
    flexGrow: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
  },
  textInputPadding: {
    flex: 1,
    paddingHorizontal: 4,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'lightgray',
  },
  textInput: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  buttonIcon: {
    width: 40,
    height: 40,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
    width: 16,
    height: 16,
    alignSelf: 'center',
  },
  backButton: {
    width: 48,
    height: 40,
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapButton: {
    width: 48,
    height: 56,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fromIcon: {
    backgroundColor: 'green',
  },
  toIcon: {
    backgroundColor: 'orange',
  },
  isHidden: { display: 'none' },
  isInSearch: {},
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 8,
  },
  modeItem: {
    height: 40,
    borderRadius: 20,
    padding: 16,
    flexGrow: 1,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
  },
  selectedMode: {
    borderWidth: 1,
  },
  modeIcon: {},
})

export default SearchDirectionBar
